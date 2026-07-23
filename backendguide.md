# Deploying `apps/api` to Google Cloud (Cloud Run)

Your API (`apps/api`) is a plain Node/Hono server (`@hono/node-server`), currently on
Render. This guide moves it to **Cloud Run** instead of a Compute Engine VM: no OS to
patch, no SSH, no nginx/SSL to configure, no systemd unit to babysit. Cloud Run runs your
container, gives you HTTPS on a public URL, and scales to zero when idle — so your $300
trial credit isn't burning while nobody's hitting the API.

**Live deployment:** project `slas-103f1`, region `us-central1`, service URL
`https://api-405590936946.us-central1.run.app`.

Database stays on Supabase (unaffected by this move). Web app stays on Vercel.

## 0. One-time setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install), then:
   ```
   gcloud auth login
   gcloud config set project slas-103f1
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
   ```
2. Link billing to the project in the [Billing console](https://console.cloud.google.com/billing) so the trial credit applies.

## 1. Dockerfile (repo root)

Build context is the monorepo root so the `workspace:*` packages resolve. `apps/api`
pulls in `puppeteer` (invoice PDFs), which needs system Chromium deps.

```dockerfile
# Dockerfile
FROM node:22-slim AS base
RUN corepack enable

# --- deps + build ---
FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/database db:generate
RUN pnpm --filter api build

# --- runtime ---
FROM base AS runtime
# Chromium deps for puppeteer (invoice PDF generation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY --from=build /app .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
```

Node **22**, not 20 — `packageManager: pnpm@11.12.0` requires Node ≥22.13; on Node 20,
corepack's pnpm install crashes before it even gets to your code.

`.dockerignore` next to it:
```
node_modules
**/node_modules
**/dist
.git
```

### The workspace-package build fix (already applied)

`apps/api`'s build used to crash on startup (`node dist/index.js`) with
`ERR_MODULE_NOT_FOUND` for `@repo/storage`'s `gcs.js` — this wasn't a Cloud Run quirk,
it would have broken **any** plain-Node deployment, including the existing Render one,
the moment that code path (file uploads / invoice PDFs) actually ran.

Root cause: `@repo/storage`, `@repo/logger`, `@repo/database`, `@repo/validation` all
ship raw `.ts` source (`"exports": {".": "./src/index.ts"}`) with no build step of their
own — fine under `tsx`/dev, but `tsup` (which builds `apps/api`) leaves workspace
packages **external** by default, so plain Node has to resolve them directly. Only
`@repo/storage` actually breaks this way, because its `index.ts` does
`export { GcsStorage } from "./gcs.js"` — a `.js` specifier with no compiled `.js` file
behind it. (`@repo/database`'s internal import points at Prisma's real generated `.js`
client, so it was never actually broken.)

Fix, in `apps/api/tsup.config.ts`:
```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  // @repo/storage's internal relative imports (index.ts -> gcs.ts/factory.ts) use
  // .js specifiers with no compiled .js file to resolve to, so leaving it external
  // breaks `node dist/index.js` at runtime. @repo/database must stay external — its
  // generated Prisma client relies on dynamic require() for native bindings, which
  // bundling breaks.
  noExternal: ["@repo/storage"],
  external: ["@google-cloud/storage"],
});
```
Also needed: `@google-cloud/storage` added as a **direct** dependency of `apps/api`
(it was only ever a transitive dep via `packages/storage`, so pnpm never linked it into
`apps/api/node_modules` — the bundled runtime couldn't see it once `@repo/storage` got
bundled in). `apps/api/package.json`'s `build` script is now just `"tsup"` (reads the
config file).

If you ever add more files to `packages/storage/src` (or give another `@repo/*` package
a similar multi-file structure with `.js`-suffixed relative imports), it needs the same
`noExternal` treatment — check by running `node apps/api/dist/index.js` locally after
a build; a clean `api listening on http://localhost:4000` (past any missing-env-var
errors) means it's fine.

### The Prisma binary-target fix (already applied)

Startup also failed with `PrismaClientInitializationError: could not locate the Query
Engine for runtime "debian-openssl-3.0.x"` — the client got generated for
`debian-openssl-1.1.x` during the Docker build, which doesn't match the debian-slim
runtime's actual OpenSSL 3.0. Fixed by pinning `binaryTargets` explicitly in
`packages/database/prisma/schema.prisma`:
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../src/generated/client"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

## 2. Build & push the image

```
gcloud artifacts repositories create api-images --repository-format=docker --location=us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/slas-103f1/api-images/api:latest .
```
`gcloud builds submit` uses Cloud Build — no local Docker install needed.

## 3. Secrets

```
echo -n 'postgresql://...supabase-direct-connection-string...' | gcloud secrets create DATABASE_URL --data-file=-
echo -n 'https://client1.vercel.app' | gcloud secrets create CORS_ORIGIN --data-file=-
echo -n '...' | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n '...' | gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-
echo -n '...' | gcloud secrets create RAZORPAY_WEBHOOK_SECRET --data-file=-
```

**Gotcha:** if `echo -n '...'` misbehaves in your shell (wrong quoting rules, or a CLI
that turns out to be `cmd.exe`/PowerShell under the hood rather than bash — both choke
on `-n` and single-quote escaping differently), skip the pipe entirely: write the value
into a plain text file (no quotes, no trailing blank line) and use
`--data-file="C:\path\to\file.txt"` instead. Symptom of a mangled secret:
`PrismaClientInitializationError: the URL must start with the protocol postgresql://`
even though the value "looks right" — that's Prisma telling you the actual secret
content doesn't start with `postgresql://` (stray quote char, literal `-n`, etc).

To update a secret's value later without deleting it: `gcloud secrets versions add
DATABASE_URL --data-file=-` (or `--data-file=path`) — Cloud Run's `:latest` reference
picks up the newest version on the next deploy.

The service account (created in step 5) also needs explicit access to read these:
```
for s in DATABASE_URL CORS_ORIGIN SUPABASE_SERVICE_ROLE_KEY RAZORPAY_KEY_SECRET RAZORPAY_WEBHOOK_SECRET; do
  gcloud secrets add-iam-policy-binding "$s" \
    --member="serviceAccount:api-storage@slas-103f1.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

Non-secret values (`SUPABASE_URL`, `GCS_PROJECT_ID`, `GCS_BUCKET_NAME`, and the
Razorpay **key ID** — not the secret — since it's a public-facing identifier like a
publishable key) go as plain `--set-env-vars`, not secrets.

## 4. GCS bucket for file storage

`packages/storage` already has a GCS driver (`packages/storage/src/gcs.ts`) — just
create the bucket/service-account wiring. **Note:** our actual bucket
(`slas-bucket-1`) lives in a *different* GCP project (`evatrilauth`) than Cloud Run
(`slas-103f1`) — that's fine, just grant cross-project IAM:

```
gcloud iam service-accounts create api-storage --project=slas-103f1

gcloud storage buckets add-iam-policy-binding gs://slas-bucket-1 \
  --member="serviceAccount:api-storage@slas-103f1.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin" \
  --project=evatrilauth
```

(If your bucket is in the same project as Cloud Run, drop `--project=evatrilauth` and
create the bucket fresh with `gcloud storage buckets create`.)

Attach the service account to the Cloud Run service (also covered by `--service-account`
on the deploy command below) so `GCS_CREDENTIALS_JSON` can be dropped entirely — the SDK
picks up ambient credentials automatically on Cloud Run.

## 5. Deploy to Cloud Run

```
gcloud run deploy api \
  --image us-central1-docker.pkg.dev/slas-103f1/api-images/api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 4000 \
  --service-account api-storage@slas-103f1.iam.gserviceaccount.com \
  --set-env-vars SUPABASE_URL=https://gxnwowplzppcyctravzx.supabase.co,GCS_PROJECT_ID=evatrilauth,GCS_BUCKET_NAME=slas-bucket-1,RAZORPAY_KEY_ID=rzp_test_TEux2UR7guXMcD \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,CORS_ORIGIN=CORS_ORIGIN:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest,RAZORPAY_WEBHOOK_SECRET=RAZORPAY_WEBHOOK_SECRET:latest
```

Cloud Run prints the public HTTPS URL. That's your `NEXT_PUBLIC_API_URL` for the Vercel
web app, and `CORS_ORIGIN` should point back at the Vercel URL.

## 6. Run migrations

Migrations don't run automatically (same as Render). From your machine, pointed at the
production `DATABASE_URL`:
```
cd packages/database
DATABASE_URL="<supabase-connection-string>" pnpm db:migrate:deploy
```

## 7. Redeploying after changes

```
gcloud builds submit --tag us-central1-docker.pkg.dev/slas-103f1/api-images/api:latest .
gcloud run deploy api --image us-central1-docker.pkg.dev/slas-103f1/api-images/api:latest --region us-central1
```
Worth wrapping in a script once you're doing it more than twice — not before.

---

**Skipped:** CI/CD (Cloud Build trigger on git push), custom domain + mapping, VPC/Cloud
SQL (you're on Supabase, so no private networking needed). Add a Cloud Build trigger
when manual `gcloud builds submit` gets annoying, not preemptively.

**Worth checking:** since the workspace-import bug (section 1) would have broken the
current Render deployment identically the moment invoice-PDF or file-upload routes were
hit, it's worth checking Render's logs for the same `ERR_MODULE_NOT_FOUND` crash, or
just retiring the Render service now that Cloud Run is live.

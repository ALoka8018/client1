# Deploying `apps/api` to Google Cloud (Cloud Run)

Your API (`apps/api`) is a plain Node/Hono server (`@hono/node-server`), currently on
Render. This guide moves it to **Cloud Run** instead of a Compute Engine VM: no OS to
patch, no SSH, no nginx/SSL to configure, no systemd unit to babysit. Cloud Run runs your
container, gives you HTTPS on a public URL, and scales to zero when idle — so your $300
trial credit isn't burning while nobody's hitting the API. If you later genuinely need a
persistent VM (long-lived background workers, custom OS-level needs), that's a different,
much larger guide — don't build it preemptively.

Database stays on Supabase (unaffected by this move). Web app stays on Vercel.

## 0. One-time setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install), then:
   ```
   gcloud auth login
   gcloud projects create plumbing-api-prod --name="Plumbing API"
   gcloud config set project plumbing-api-prod
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
   ```
   (If you already have a GCP project you want to reuse, `gcloud config set project <id>` instead of creating one.)
2. Link billing to the project in the [Billing console](https://console.cloud.google.com/billing) so your $300 credit applies.

## 1. Add a Dockerfile

Cloud Run needs a container. There's no Dockerfile yet — add one at the repo root
(build context must be the monorepo root so the `workspace:*` packages resolve).

`apps/api` pulls in `puppeteer` (for invoice PDFs), which needs system Chromium
dependencies — that's the one non-obvious part of this image.

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

Check `apps/api/src/lib/invoice-pdf.ts` for how it launches puppeteer — if it doesn't
already read `PUPPETEER_EXECUTABLE_PATH`, pass `executablePath: process.env.PUPPETEER_EXECUTABLE_PATH`
into the `puppeteer.launch()` call, otherwise it'll try to download its own Chromium at
build time (slow image, and blocked by `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` above).

Add a `.dockerignore` next to it so the build doesn't ship `node_modules`/`dist` from your
host:
```
node_modules
**/node_modules
**/dist
.git
```

## 2. Build & push the image

```
gcloud artifacts repositories create api-images --repository-format=docker --location=us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/plumbing-api-prod/api-images/api:latest .
```

`gcloud builds submit` uses Cloud Build (already enabled above) — no local Docker install
needed.

## 3. Set your secrets

Put real values in Secret Manager once instead of pasting them into every deploy command:

```
gcloud services enable secretmanager.googleapis.com

echo -n "postgresql://...supabase-connection-string..." | gcloud secrets create DATABASE_URL --data-file=-
echo -n "https://client1.vercel.app" | gcloud secrets create CORS_ORIGIN --data-file=-
echo -n "your-supabase-service-role-key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n "your-razorpay-key-secret" | gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-
echo -n "your-razorpay-webhook-secret" | gcloud secrets create RAZORPAY_WEBHOOK_SECRET --data-file=-
```
Repeat for every value currently in `apps/api/.env.example` that isn't safe to hardcode
(anything that isn't a secret — like `SUPABASE_URL`, `GCS_PROJECT_ID`, `GCS_BUCKET_NAME` —
can just be a plain `--set-env-vars` instead of a secret).

## 4. Deploy to Cloud Run

```
gcloud run deploy api \
  --image us-central1-docker.pkg.dev/plumbing-api-prod/api-images/api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 4000 \
  --set-env-vars SUPABASE_URL=https://your-project-ref.supabase.co,GCS_PROJECT_ID=your-gcp-project-id,GCS_BUCKET_NAME=your-bucket \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,CORS_ORIGIN=CORS_ORIGIN:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest,RAZORPAY_WEBHOOK_SECRET=RAZORPAY_WEBHOOK_SECRET:latest
```

Cloud Run prints your public HTTPS URL, e.g. `https://api-xxxxx-uc.a.run.app`. That's your
new `NEXT_PUBLIC_API_URL` for the Vercel web app, and your `CORS_ORIGIN` secret above should
point back at the Vercel URL.

## 5. GCS bucket for file storage

`packages/storage` already has a GCS driver (`packages/storage/src/gcs.ts`), so you don't
need to build anything — just create the bucket and a service account:

```
gcloud storage buckets create gs://your-bucket-name --location=us-central1
gcloud iam service-accounts create api-storage
gcloud storage buckets add-iam-policy-binding gs://your-bucket-name \
  --member="serviceAccount:api-storage@plumbing-api-prod.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

Better than the `GCS_CREDENTIALS_JSON` base64-blob approach in `.env.example`: attach the
service account directly to the Cloud Run service instead —
```
gcloud run services update api --service-account=api-storage@plumbing-api-prod.iam.gserviceaccount.com
```
— then `GCS_CREDENTIALS_JSON` can be dropped entirely; the GCS SDK picks up ambient
credentials automatically on Cloud Run.

## 6. Run migrations

Migrations still don't run automatically (same as the Render setup). From your machine,
pointed at the production `DATABASE_URL`:
```
cd packages/database
DATABASE_URL="<supabase-connection-string>" pnpm db:migrate:deploy
```

## 7. Redeploying after changes

```
gcloud builds submit --tag us-central1-docker.pkg.dev/plumbing-api-prod/api-images/api:latest .
gcloud run deploy api --image us-central1-docker.pkg.dev/plumbing-api-prod/api-images/api:latest --region us-central1
```
Worth wrapping in a script (`scripts/deploy.sh`) once you're doing it more than twice —
not before.

---

**Skipped:** CI/CD (Cloud Build trigger on git push), custom domain + mapping, VPC/Cloud SQL
(you're on Supabase, not Cloud SQL, so no private networking needed). Add a Cloud Build
trigger when manual `gcloud builds submit` gets annoying, not preemptively.

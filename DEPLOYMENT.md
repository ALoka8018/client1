# Deployment

Repo: https://github.com/ALoka8018/client1

Two independent deploys off the same repo: `apps/web` on Vercel, `apps/api` on Render.
Database is Supabase Postgres. The steps below need your own Supabase/Render/Vercel logins —
they can't be done from the CLI in this environment, so follow them in each dashboard.

## 1. Database (Supabase Postgres)

1. Create a project at supabase.com
2. Project Settings → Database → Connection string. Supabase gives you two:
   - **Direct connection** (port 5432) — fine for local dev and for Render (long-running
     server, not serverless)
   - **Transaction pooler** (port 6543, via Supavisor) — use this instead if you ever move
     the API to a serverless/edge runtime; append `?pgbouncer=true` to the URL for Prisma
3. Copy the direct connection string as `DATABASE_URL`, put it in `packages/database/.env`,
   then run the first migration:
   ```
   cd packages/database
   pnpm db:migrate:deploy
   pnpm db:seed
   ```

## 2. API on Render (free tier)

Render still has a genuine free web-service tier — it does sleep after 15 min of inactivity
(30-60s cold start on the next request), but it costs nothing and needs zero code changes
since our API is a normal long-running Node server (`@hono/node-server`). Railway and Fly.io
no longer have real free tiers as of 2026, which is why Render is the pick here.

1. New → **Blueprint** → connect the `ALoka8018/client1` repo. Render will read the
   `render.yaml` at the repo root automatically:
   - build: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter api build`
   - start: `node apps/api/dist/index.js`
   - plan: `free`
2. When prompted, fill in the env vars flagged `sync: false` in `render.yaml`:
   - `DATABASE_URL` — from step 1
   - `CORS_ORIGIN` — the web app's URL, e.g. `https://client1.vercel.app` (comma-separate if
     you need more than one, e.g. a preview URL too)
3. Deploy, then note the generated public URL (e.g. `https://client1-api.onrender.com`) —
   you'll need it for step 3.
4. If the free-tier sleep/cold-start becomes a problem (e.g. real customers hitting a cold
   API), the fix is a paid Render instance ($7/mo) or a cron ping to keep it warm — not
   something to solve preemptively.

## 3. Web app on Vercel

1. Import Project → `ALoka8018/client1`
2. Set **Root Directory** to `apps/web` (Vercel auto-detects the pnpm workspace/Turborepo
   from there — no custom build command needed)
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` — the Render URL from step 2
   - Clerk keys, once auth is wired up (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
     `CLERK_SECRET_KEY`)
4. Deploy. Every push to `main` redeploys both automatically once connected.

## 4. Plan: backend CI/CD → GCP Cloud Run (replaces Render)

Status: **planned, not wired up yet.** Render stays the live API until this cuts over.

Why Cloud Run: the API is already a container (root `Dockerfile`) and already talks to GCS,
so it's one `gcloud run deploy` away. It scales to zero (no idle cost, no free-tier sleep
penalty like Render), and Cloud Build builds the image for us — no Artifact Registry wiring,
no Docker build/push in CI, no registry credentials.

### 4.1 One-time GCP setup (run locally, `gcloud` logged in)

```bash
PROJECT=plumbing-all-solution      # your project id
REGION=asia-south1                 # Mumbai; match your users/DB
REPO=ALoka8018/client1

gcloud config set project $PROJECT
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com iamcredentials.googleapis.com

# runtime service account for the API
gcloud iam service-accounts create api-runtime --display-name="Cloud Run API"
```

### 4.2 Secrets live in Secret Manager, not in GitHub

One home for every value, and the workflow never sees them. Create one secret per env var:

```bash
for S in DATABASE_URL CORS_ORIGIN SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY \
         GCS_BUCKET_NAME GCS_PROJECT_ID RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET \
         RAZORPAY_WEBHOOK_SECRET SMTP_USER SMTP_PASS MAIL_FROM SUPPORT_INBOX_EMAIL; do
  gcloud secrets create $S --replication-policy=automatic
  # then: printf '%s' 'value' | gcloud secrets versions add $S --data-file=-
done

gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:api-runtime@$PROJECT.iam.gserviceaccount.com" \
  --role=roles/secretmanager.secretAccessor
```

`GCS_CREDENTIALS_JSON` is **not** needed on Cloud Run — the runtime service account is the
credential. Give it `roles/storage.objectAdmin` on the bucket and drop the env var; the
`@google-cloud/storage` client picks up ambient credentials automatically.

### 4.3 GitHub → GCP auth: Workload Identity Federation, no key files

```bash
gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github-oidc \
  --location=global --workload-identity-pool=github \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$REPO'"

gcloud iam service-accounts create gh-deployer --display-name="GitHub Actions deployer"
for R in roles/run.admin roles/cloudbuild.builds.editor roles/storage.admin \
         roles/artifactregistry.writer roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:gh-deployer@$PROJECT.iam.gserviceaccount.com" --role=$R
done
# let gh-deployer deploy *as* api-runtime
gcloud iam service-accounts add-iam-policy-binding api-runtime@$PROJECT.iam.gserviceaccount.com \
  --member="serviceAccount:gh-deployer@$PROJECT.iam.gserviceaccount.com" \
  --role=roles/iam.serviceAccountUser
# let the GitHub repo impersonate gh-deployer
PROJECT_NUM=$(gcloud projects describe $PROJECT --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding gh-deployer@$PROJECT.iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUM/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"
```

Only two **GitHub repo variables** (not secrets — they're not sensitive):
`GCP_PROJECT` and `GCP_WIF_PROVIDER`
(`projects/$PROJECT_NUM/locations/global/workloadIdentityPools/github/providers/github-oidc`).

### 4.4 The workflow — `.github/workflows/deploy-api.yml`

Runs on pushes to `main` that touch the API or anything it depends on. Migrations run
before the deploy, pulling `DATABASE_URL` straight out of Secret Manager (the OIDC token
already grants access, so nothing is duplicated into GitHub).

```yaml
name: Deploy API
on:
  push:
    branches: [main]
    paths: ['apps/api/**', 'packages/**', 'Dockerfile', 'pnpm-lock.yaml', '.github/workflows/deploy-api.yml']
  workflow_dispatch:

concurrency: { group: deploy-api, cancel-in-progress: false }

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { contents: read, id-token: write }
    env:
      REGION: asia-south1
      SERVICE: client1-api
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ vars.GCP_WIF_PROVIDER }}
          service_account: gh-deployer@${{ vars.GCP_PROJECT }}.iam.gserviceaccount.com
      - uses: google-github-actions/setup-gcloud@v2

      # typecheck: cheap gate, and the build fails slower inside Cloud Build
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api check-types

      - name: Run migrations
        run: |
          export DATABASE_URL="$(gcloud secrets versions access latest --secret=DATABASE_URL)"
          pnpm --filter @repo/database db:migrate:deploy

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy "$SERVICE" \
            --source . --region "$REGION" \
            --service-account "api-runtime@${{ vars.GCP_PROJECT }}.iam.gserviceaccount.com" \
            --allow-unauthenticated \
            --min-instances 0 --max-instances 4 \
            --memory 1Gi --cpu 1 --timeout 120 \
            --set-env-vars NODE_ENV=production \
            --set-secrets "DATABASE_URL=DATABASE_URL:latest,CORS_ORIGIN=CORS_ORIGIN:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,GCS_BUCKET_NAME=GCS_BUCKET_NAME:latest,GCS_PROJECT_ID=GCS_PROJECT_ID:latest,RAZORPAY_KEY_ID=RAZORPAY_KEY_ID:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest,RAZORPAY_WEBHOOK_SECRET=RAZORPAY_WEBHOOK_SECRET:latest,SMTP_USER=SMTP_USER:latest,SMTP_PASS=SMTP_PASS:latest,MAIL_FROM=MAIL_FROM:latest,SUPPORT_INBOX_EMAIL=SUPPORT_INBOX_EMAIL:latest"
```

### 4.5 Code changes this needs

1. **Port** — Cloud Run injects `PORT=8080`. `apps/api` must listen on `process.env.PORT`
   with `4000` only as the local fallback (verify before cutover).
2. **Health check** — Cloud Run's readiness probe hits `/`. The existing health route is
   enough; just make sure it doesn't touch the DB (a slow DB shouldn't fail a deploy).
3. **`GCS_CREDENTIALS_JSON`** — make it optional in `packages/storage`, so the client falls
   back to ambient credentials when it's unset (see 4.2).
4. **Memory** — puppeteer/Chromium needs ~1Gi. If invoice PDFs OOM, bump `--memory 2Gi`
   before debugging anything else.

### 4.6 Cutover

1. Merge the workflow, let it deploy, and hit the Cloud Run URL directly (`/health`, one
   real read endpoint, one invoice PDF).
2. Point `NEXT_PUBLIC_API_URL` in Vercel at the Cloud Run URL, and add the Vercel domain to
   the `CORS_ORIGIN` secret.
3. Leave Render running for a day, then suspend it. Delete `render.yaml` once Cloud Run has
   been stable for a week.

Deliberately skipped: staging environment, Terraform, canary/gradual traffic splits,
`gcloud run deploy --no-traffic` + tag-then-promote. Add staging when a bad deploy actually
hurts a customer; add traffic splitting when a rollback is ever needed mid-deploy (until
then `gcloud run services update-traffic --to-revisions=PREVIOUS=100` is the rollback).

## Notes

- CORS is enforced in `apps/api` via `hono/cors`, reading allowed origins from `CORS_ORIGIN`
  (comma-separated). Update it whenever the web app's domain changes.
- Migrations are **not** run automatically on the Render deploy (the planned Cloud Run
  pipeline in §4 does run them). After schema changes, run
  `pnpm --filter @repo/database db:migrate:deploy` against the production `DATABASE_URL`
  as a manual step before/after deploying the API.
- Free-tier caveat to keep in mind: Render's free service sleeping means the *first* request
  after idle time is slow. Fine for early development/demo; revisit before a real launch.

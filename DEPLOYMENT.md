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

## Notes

- CORS is enforced in `apps/api` via `hono/cors`, reading allowed origins from `CORS_ORIGIN`
  (comma-separated). Update it whenever the web app's domain changes.
- Migrations are **not** run automatically on deploy. After schema changes, run
  `pnpm --filter @repo/database db:migrate:deploy` against the production `DATABASE_URL`
  as a manual step before/after deploying the API.
- Free-tier caveat to keep in mind: Render's free service sleeping means the *first* request
  after idle time is slow. Fine for early development/demo; revisit before a real launch.

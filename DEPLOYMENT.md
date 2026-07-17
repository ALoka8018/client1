# Deployment

Repo: https://github.com/ALoka8018/client1

Two independent deploys off the same repo: `apps/web` on Vercel, `apps/api` on Railway.
The steps below need your own Vercel/Railway/Neon logins — they can't be done from the CLI
in this environment, so follow them in each dashboard.

## 1. Database (Neon)

1. Create a project at neon.tech (or use Railway's Postgres plugin instead — either works)
2. Copy the pooled connection string as `DATABASE_URL`
3. From your machine, run the first migration against it:
   ```
   cd packages/database
   # put the real connection string in packages/database/.env
   pnpm db:migrate:deploy
   pnpm db:seed
   ```

## 2. API on Railway

1. New Project → **Deploy from GitHub repo** → `ALoka8018/client1`
2. Leave the service root at the repo root (do **not** set a Root Directory) — `railway.json`
   at the repo root already defines the build/start commands:
   - build: `pnpm install --frozen-lockfile && pnpm --filter api build`
   - start: `node apps/api/dist/index.js`
3. Set environment variables on the service:
   - `DATABASE_URL` — from step 1
   - `PORT` — Railway sets this automatically, no action needed
   - `CORS_ORIGIN` — the web app's URL, e.g. `https://client1.vercel.app` (comma-separate if
     you need more than one, e.g. a preview URL too)
4. Deploy, then note the generated public URL (e.g. `https://client1-api.up.railway.app`) —
   you'll need it for step 3.

## 3. Web app on Vercel

1. Import Project → `ALoka8018/client1`
2. Set **Root Directory** to `apps/web` (Vercel auto-detects the pnpm workspace/Turborepo
   from there — no custom build command needed)
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` — the Railway URL from step 2
   - Clerk keys, once auth is wired up (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
     `CLERK_SECRET_KEY`)
4. Deploy. Every push to `main` redeploys both automatically once connected.

## Notes

- CORS is enforced in `apps/api` via `hono/cors`, reading allowed origins from `CORS_ORIGIN`
  (comma-separated). Update it whenever the web app's domain changes.
- Migrations are **not** run automatically on deploy. After schema changes, run
  `pnpm --filter @repo/database db:migrate:deploy` against the production `DATABASE_URL`
  as a manual step before/after deploying the API.

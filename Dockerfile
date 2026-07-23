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

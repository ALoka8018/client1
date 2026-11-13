# 💧 Seepage Doctor (`plumbingAllSolution`)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.13-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-11.28.9-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-blue.svg)](https://turbo.build/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2_(App_Router)-black.svg)](https://nextjs.org/)
[![Hono](https://img.shields.io/badge/Hono-4.12-E36002.svg)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3ECF8E.svg)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B.svg)](https://razorpay.com/)

**Seepage Doctor** is an enterprise-grade, full-stack home services platform engineered for modern plumbing, advanced acoustic/thermal leak detection, waterproofing, and structural property health inspections. Operating across Odisha (Bhubaneswar, Cuttack, Puri, Rourkela), the platform delivers a unified ecosystem connecting property owners, certified field technicians, and operations administrators.

---

## 📑 Table of Contents

- [Core Features & Portals](#-core-features--portals)
  - [Customer Portal](#1-customer-portal)
  - [Field Technician Portal](#2-field-technician-portal)
  - [Admin & Super Admin Portal](#3-admin--super-admin-portal)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Monorepo Structure](#-monorepo-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Clone & Install Dependencies](#1-clone--install-dependencies)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Database Initialization & Seeding](#3-database-initialization--seeding)
  - [4. Start Development Servers](#4-start-development-servers)
- [Local Access & API Documentation](#-local-access--api-documentation)
- [Environment Variables Reference](#-environment-variables-reference)
- [Available Monorepo Scripts](#-available-monorepo-scripts)
- [Database Management (Prisma)](#-database-management-prisma)
- [Security & Architecture Highlights](#-security--architecture-highlights)
- [Deployment Guide](#-deployment-guide)

---

## 🌟 Core Features & Portals

### 1. Customer Portal
- **Pincode Serviceability Engine:** Instant postal code verification to confirm service coverage across active operational zones in Odisha.
- **Multi-Step Booking Flow:** Book inspections, emergency repairs, or waterproofing projects with date/time slot selection and location details.
- **Real-Time Job Lifecycle Tracking:** Visual audit trail following jobs from `REQUESTED` &rarr; `CONFIRMED` &rarr; `ASSIGNED` &rarr; `EN_ROUTE` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`.
- **Razorpay Online Checkout:** Secure digital payments for service estimates and final invoices (UPI, cards, net banking).
- **Automated PDF Invoices:** Headless Chrome (Puppeteer) server-side HTML-to-PDF invoice rendering with authenticated download links.
- **Property Health Diagnostic Hub:** Track plumbing, structural, and moisture health metrics per registered property.
- **Verified Customer Reviews:** Leave verified ratings and reviews linked directly to completed service bookings.
- **Support Ticketing System:** Submit support queries and follow ticket resolution status.

### 2. Field Technician Portal
- **Mobile-First Workboard:** View assigned tasks, upcoming appointments, and service addresses.
- **Milestone Status Control:** Update progress through field stages (`EN_ROUTE` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`).
- **Material & Diagnostics Logging:** Record field materials used, diagnostic notes, and job observations.
- **Photo Evidence Upload:** Upload before/after job photos directly to cloud storage.

### 3. Admin & Super Admin Portal
- **Operational Command Center:** Live dashboard tracking active bookings, revenue metrics, and technician allocation.
- **Smart Dispatch:** Match and assign unassigned bookings to active certified technicians.
- **Service Catalog CRUD:** Configure service categories, individual service cards, pricing tiers, and descriptions.
- **Review Moderation:** Approve or hide customer feedback before publishing to public listings.
- **Project Showcase Management:** Curate featured before/after inspection galleries.
- **Technician Onboarding:** Review, verify, and approve technician applications.

---

## 🏛 Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Client["Frontend (apps/web)"]
        A[Next.js 16 App Router] -->|React 19 + Tailwind CSS 4| B[Client & SSR Components]
        B -->|Supabase SSR Auth| C[User Session & JWT]
    end

    subgraph Gateway["Backend API (apps/api)"]
        D[Hono on Node.js Server]
        E[Auth Middleware / JIT User Upsert]
        F[Rate Limiting & Secure Headers]
        G[Swagger / OpenAPI Docs]
        D --> E
        D --> F
        D --> G
    end

    subgraph Data["Database & Storage (packages/database & storage)"]
        H[(Supabase PostgreSQL)]
        I[Prisma ORM Client]
        J[Google Cloud Storage / Local Memory Fallback]
        K[Puppeteer PDF Engine]
    end

    subgraph External["External Services"]
        L[Supabase Auth Service]
        M[Razorpay Gateway & Webhooks]
        N[SMTP Mailer / Nodemailer]
    end

    B -->|REST API Requests with Bearer JWT| D
    C <-->|Auth Tokens| L
    E <-->|Verify JWT| L
    D -->|Prisma Queries| I --> H
    D -->|Upload Site Photos & Invoices| J
    D -->|Render PDF Invoices| K
    B -->|Checkout Modal| M
    M -->|HMAC-SHA256 Signed Webhooks| D
    D -->|Booking & Status Emails| N
```

### Technology Breakdown

| Component | Technology | Workspace Package |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript | `apps/web` |
| **Styling** | Tailwind CSS v4, Lucide Icons | `apps/web` & `@repo/ui` |
| **Backend REST API** | Hono (`@hono/node-server`), TypeScript, `tsup` | `apps/api` |
| **Database & ORM** | PostgreSQL (Supabase) + Prisma ORM 6 | `packages/database` |
| **Authentication** | Supabase Auth (JWT Bearer Tokens + SSR Cookies) | `apps/web` & `apps/api` |
| **Payment Gateway** | Razorpay (Orders, client checkout, HMAC webhooks) | `apps/api` & `apps/web` |
| **Invoice Generation** | Puppeteer (Headless Chromium HTML-to-PDF) | `apps/api` |
| **Asset & PDF Storage** | Google Cloud Storage (with local `InMemoryStorage` fallback) | `packages/storage` |
| **Validation** | Zod (Shared schemas between client and server) | `packages/validation` |
| **Monorepo Tools** | pnpm Workspaces, Turborepo 2, Concurrently | Root workspace |

---

## 📂 Monorepo Structure

```text
.
├── apps/
│   ├── api/                         # Hono REST API server (Port 4000)
│   │   ├── src/
│   │   │   ├── index.ts             # App entry, CORS, security headers, routing
│   │   │   ├── modules/             # Domain modules: bookings, payments, reviews, etc.
│   │   │   └── scripts/             # Admin seeding & verification scripts
│   │   ├── tsup.config.ts           # Production bundling configuration
│   │   └── Dockerfile               # Node 22 + Chromium production image
│   └── web/                         # Next.js 16 web application (Port 3000)
│       ├── src/
│       │   ├── app/                 # Next.js App Router route groups:
│       │   │   ├── (auth)/          # Login, Register, Forgot Password
│       │   │   ├── (marketing)/     # Landing, Services, About, Careers, Contact
│       │   │   ├── (customer)/      # Customer Dashboard, Bookings, Account, Support
│       │   │   ├── (technician)/    # Technician Workboard & Job Execution
│       │   │   └── (admin)/         # Admin Analytics, Dispatch, Service Manager
│       │   ├── components/          # App-level UI components
│       │   ├── lib/                 # Supabase client/server helpers & API fetchers
│       │   └── middleware.ts        # Route protection & Supabase session refresher
├── packages/
│   ├── database/                    # Prisma schema, migrations, seed script, generated client
│   ├── validation/                  # Shared Zod validation schemas
│   ├── storage/                     # Storage driver (Google Cloud Storage + InMemory fallback)
│   ├── ui/                          # Shared reusable React component library
│   ├── types/                       # Shared TypeScript definitions
│   ├── logger/                      # Shared structured logging utility
│   ├── seo/                         # Metadata and OpenGraph generators
│   ├── utils/                       # Shared utility functions
│   └── config/                      # Shared base TypeScript configurations
├── .env.example                     # All-in-one environment variable reference
├── package.json                     # Monorepo root scripts & dev dependencies
├── pnpm-workspace.yaml              # Monorepo workspace configuration
├── turbo.json                       # Turborepo task pipeline configuration
└── Dockerfile                       # Multi-stage production container for apps/api
```

---

## ⚡ Prerequisites

Before getting started, make sure your machine has:

- **Node.js:** `>= 22.13.0` (Required by `pnpm@11.x` and Corepack)
- **pnpm:** `11.28.9`
  ```bash
  # Enable via Corepack (recommended)
  corepack enable
  corepack prepare pnpm@11.28.9 --activate

  # Or install globally via npm
  npm install -g pnpm@11.28.9
  ```
- **PostgreSQL Database:** A running PostgreSQL instance (or free managed database at [Supabase](https://supabase.com)).
- **Supabase Account:** For Supabase Auth and database connectivity.
- **Razorpay Account (Optional for local testing):** Test API keys (`rzp_test_...`) for payment workflows.

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/plumbingAllSolution.git
cd plumbingAllSolution

# Install all monorepo dependencies
pnpm install
```

### 2. Configure Environment Variables

The repository includes a root `.env.example` as well as package-level `.env.example` files.

#### Windows (PowerShell):
```powershell
Copy-Item packages\database\.env.example packages\database\.env
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local
```

#### macOS / Linux (Bash):
```bash
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

> **Note:** Fill in your real `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in their respective `.env` files.

---

### 3. Database Initialization & Seeding

Run the database pipeline from the root directory:

```bash
# 1. Generate the Prisma Client
pnpm --filter @repo/database db:generate

# 2. Apply migrations to PostgreSQL
pnpm --filter @repo/database db:migrate:deploy
# (During active schema development, you can use: pnpm --filter @repo/database db:migrate)

# 3. Seed default categories, services, service areas, and testimonials
pnpm --filter @repo/database db:seed

# 4. (Optional) Create or sync an initial Super Admin user in Supabase & Postgres
pnpm --filter api seed:admin
```

---

### 4. Start Development Servers

Run both the Hono backend API and the Next.js frontend in parallel:

```bash
# Start all workspaces via Turborepo
pnpm dev

# OR start with color-coded side-by-side terminal logs
pnpm dev:all
```

To run individual applications:
```bash
pnpm --filter api dev    # Runs Hono API on http://localhost:4000
pnpm --filter web dev    # Runs Next.js frontend on http://localhost:3000
```

---

## 🌐 Local Access & API Documentation

| Endpoint / App | URL | Description |
|---|---|---|
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Next.js marketing and customer/technician/admin portals |
| **Backend API Health** | [http://localhost:4000/health](http://localhost:4000/health) | API health check status endpoint |
| **Interactive Swagger Docs** | [http://localhost:4000/docs](http://localhost:4000/docs) | Interactive Swagger UI API documentation |
| **OpenAPI Specification** | [http://localhost:4000/openapi.json](http://localhost:4000/openapi.json) | Raw OpenAPI 3.0 JSON specification |
| **Prisma Studio (GUI)** | [http://localhost:5555](http://localhost:5555) | Run `pnpm --filter @repo/database db:studio` |

---

## 🔐 Environment Variables Reference

### 1. Database (`packages/database/.env` and `apps/api/.env`)
| Variable | Description | Sample / Default Value | Required |
|---|---|---|:---:|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/plumbing?schema=public` | **Yes** |

### 2. Backend API (`apps/api/.env`)
| Variable | Description | Sample / Default Value | Required |
|---|---|---|:---:|
| `PORT` | HTTP port for the Hono server | `4000` | No |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` | No |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins | `http://localhost:3000` | **Yes** |
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role key (for backend auth verification) | `eyJh...` | **Yes** |
| `RAZORPAY_KEY_ID` | Razorpay public key ID | `rzp_test_1234567890ABCD` | For payments |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | `your_razorpay_secret` | For payments |
| `RAZORPAY_WEBHOOK_SECRET` | Secret to verify Razorpay webhook signatures | `your_webhook_secret` | For webhooks |
| `SMTP_HOST` | Outgoing SMTP server host | `smtp.gmail.com` | For emails |
| `SMTP_PORT` | Outgoing SMTP server port | `587` | For emails |
| `SMTP_USER` | Outgoing SMTP user account email | `notifications@example.com` | For emails |
| `SMTP_PASS` | Outgoing SMTP password or app password | `your_app_password` | For emails |
| `MAIL_FROM` | Sender name and email header | `Seepage Doctor <no-reply@seepagedoctor.com>` | For emails |
| `SUPPORT_INBOX_EMAIL` | Inbox for support alerts and applications | `support@seepagedoctor.com` | No |
| `GCS_PROJECT_ID` | Google Cloud project ID *(omitting activates local in-memory fallback)* | `seepage-doctor-gcp` | No |
| `GCS_BUCKET_NAME` | Cloud storage bucket name for invoices and photos | `seepage-doctor-bucket` | No |
| `GCS_CREDENTIALS_JSON` | Base64-encoded GCP service account JSON key | `eyJu...` | No |
| `ADMIN_EMAIL` | Email used by `seed:admin` script | `admin@seepagedoctor.com` | No |
| `ADMIN_PASSWORD` | Password used by `seed:admin` script | `Admin@Password123!` | No |
| `ADMIN_NAME` | Display name for the initial admin | `Super Admin` | No |
| `ADMIN_ROLE` | Role assignment (`ADMIN` or `SUPER_ADMIN`) | `SUPER_ADMIN` | No |

### 3. Frontend Web (`apps/web/.env.local`)
| Variable | Description | Sample / Default Value | Required |
|---|---|---|:---:|
| `NEXT_PUBLIC_API_URL` | Base URL of backend API | `http://localhost:4000` | **Yes** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (must match backend) | `https://your-project.supabase.co` | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase Anon key (safe for browser JS) | `eyJh...` | **Yes** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key for client-side checkout | `rzp_test_1234567890ABCD` | For payments |

---

## 🛠 Available Monorepo Scripts

Run these scripts from the repository root:

```bash
# Development
pnpm dev                     # Start all apps using Turborepo
pnpm dev:all                 # Start API and Web with concurrently

# Building & Linting
pnpm build                   # Build all apps and packages in topological order
pnpm lint                    # Lint all workspaces with ESLint

# Workspace-specific operations
pnpm --filter api check-types   # Type-check the API codebase
pnpm --filter api test          # Run Vitest test suite on the API
pnpm --filter web build         # Build the Next.js frontend

# Adding packages to workspaces
pnpm --filter web add <pkg>     # Add a package to apps/web
pnpm --filter api add <pkg>     # Add a package to apps/api
pnpm --filter api add @repo/validation --workspace # Link internal package
```

---

## 🗄 Database Management (Prisma)

All database operations reside within `packages/database`. The client outputs to `packages/database/src/generated/client` to guarantee compatibility across Windows, Linux, and Docker container runtimes:

```bash
# Generate Prisma Client after schema changes
pnpm --filter @repo/database db:generate

# Apply pending migrations to database
pnpm --filter @repo/database db:migrate:deploy

# Create and apply a new migration during local development
pnpm --filter @repo/database db:migrate

# Push schema directly to database without generating migration files
pnpm --filter @repo/database db:push

# Open graphical database browser
pnpm --filter @repo/database db:studio

# Run database seed script
pnpm --filter @repo/database db:seed
```

---

## 🛡 Security & Architecture Highlights

1. **Just-In-Time (JIT) User Upsert:**
   The API verifies incoming Supabase JWT tokens via `requireAuth`. On the first authenticated request, it automatically upserts the corresponding user profile in PostgreSQL, preventing desynchronization between Supabase Auth and Prisma DB.
2. **Role-Based Access Control (RBAC):**
   Endpoints enforce strict role requirements (`CUSTOMER`, `TECHNICIAN`, `ADMIN`, `SUPER_ADMIN`). Route groups in Next.js (`(customer)`, `(technician)`, `(admin)`) are protected at both the edge middleware layer (`apps/web/src/middleware.ts`) and the API controller layer (`requireRole`).
3. **Idempotent Webhook Processing:**
   Payment webhooks from Razorpay compute HMAC-SHA256 signatures against the raw payload. Every processed transaction records its `eventId` in the `WebhookEvent` table (`@@unique([provider, eventId])`), guaranteeing zero duplicate order completions.
4. **Resilient Cloud & Local Storage:**
   The `@repo/storage` abstraction provides unified storage operations. In local development or staging environments where Google Cloud credentials are not configured, it seamlessly falls back to `InMemoryStorage` with zero runtime crashes.
5. **Rate Limiting & Defensive Headers:**
   Public and sensitive endpoints (booking requests, leads, reviews, support tickets) are protected by fixed-window IP rate limiters and strict HTTP security headers (`secureHeaders` and CORS origin validation).

---

## 🚢 Deployment Guide

### Backend API (`apps/api`) &rarr; Google Cloud Run
The API is containerized using the multi-stage `Dockerfile` (Node 22 Slim with system Chromium dependencies for Puppeteer):

```bash
# Build and deploy with Google Cloud CLI
gcloud auth login
gcloud config set project your-gcp-project-id
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# Build and submit container image
gcloud builds submit --tag gcr.io/your-gcp-project-id/seepage-doctor-api

# Deploy to Cloud Run
gcloud run deploy seepage-doctor-api \
  --image gcr.io/your-gcp-project-id/seepage-doctor-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000
```

### Frontend (`apps/web`) &rarr; Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `apps/web`.
3. Configure Environment Variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`).
4. Framework preset will automatically detect Next.js.

### Database & Auth &rarr; Supabase
- Managed PostgreSQL database with connection pooling enabled.
- Supabase Auth handling email/password authentication and JWT issuance.

---

## 📄 License & Attribution

This project is proprietary and maintained for **Seepage Doctor** (`plumbingAllSolution`). All rights reserved.

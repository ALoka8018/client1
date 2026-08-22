# Technician Mobile App — Design

## Context

`apps/web` already serves customers, admins, and technicians (via the
`(portal)/technician` and `(portal)/admin` route groups) from one Next.js
app. Two gaps were identified:

1. Field technicians have no native app — they use the mobile web view of
   `(portal)/technician`, which has no camera/GPS integration and requires
   a browser session.
2. Admin/staff tooling is bundled into the same deploy as the public
   marketing site. (Out of scope for this spec — tracked as a follow-up;
   this spec covers the technician mobile app only, decided as the
   higher-priority gap.)

The backend already anticipated this: `apps/api/src/lib/attachments.ts`
has a comment describing the current admin-only photo upload as "the
short-term stopgap... until a technician app (Phase 3) exists."

## Goal

Ship a technician-facing mobile app (iOS + Android) that lets a
technician: see their assigned jobs, update job status in the field,
and upload before/after photos — replacing the mobile-web workaround.

## Non-goals

- Offline-first sync (see Data flow section).
- Push notifications (stretch/phase 2, not required for v1).
- Rebuilding admin/assignment tooling — that stays in `apps/web` for now.
- A separate standalone admin web app — deferred to a later spec.

## Tech stack

- **Expo (managed) + TypeScript + React Navigation.** Chosen over bare
  React Native (no native modules needed beyond what Expo ships) and over
  Flutter (would fork the stack away from the rest of the TS monorepo and
  couldn't reuse `@repo/types` / `@repo/validation`).
- **Supabase Auth** (`@supabase/supabase-js`) — identical to the web app.
  No new auth backend; the existing `requireAuth` / `requireRole` Hono
  middleware in `apps/api/src/middleware/auth.ts` already gates by JWT.
- **TanStack Query** for server state (fetch/cache/mutate against
  `apps/api`).
- Lives at `apps/mobile` in the existing Turborepo, sharing
  `@repo/types` and `@repo/validation` with `apps/web` and `apps/api`.

## API surface

All reused as-is — no backend changes needed. The mobile app is a pure
client:
- `GET /v1/technician/jobs` (`apps/api/src/index.ts:431`)
- `PATCH /v1/technician/jobs/:id/status` (`apps/api/src/index.ts:437`)
- `POST /v1/bookings/:id/attachments` (`apps/api/src/index.ts:295`) —
  already accepts `UserRole.TECHNICIAN`, already checks
  `isBookingAssignedToTechnician` so a technician can only attach photos
  to their own assigned bookings. (Corrected from an earlier draft of
  this spec, which assumed a new endpoint was needed — it already
  exists.)

## Screens

1. **Login** — email/password via Supabase.
2. **Job List** — Today / Upcoming tabs, pull-to-refresh.
3. **Job Detail** — customer name/phone (tap-to-call), address
   (tap-to-open-maps), service + notes, status action buttons scoped to
   the job's current status (En Route → Arrived → Complete, with a
   "materials used" field on Complete).
4. **Photo capture** — before/after toggle, camera or gallery
   (`expo-image-picker`) → uploads via the new attachment endpoint.
5. **Profile / logout.**

## Data flow & error handling

TanStack Query handles fetch/cache/refetch-on-focus for the job list.
Status updates and photo uploads are plain mutations; on failure, show a
retry toast and leave the local state unchanged (no optimistic rollback
complexity needed — the mutation either lands or the user retries).

`ponytail:` deliberately skipping an offline-first sync/retry queue —
technicians have signal on-site the large majority of the time. If real
field usage shows dropped updates, add an AsyncStorage-backed retry
queue then, not preemptively.

Push notifications for "new job assigned" reuse the existing `notify()`
call in `assignTechnicianToBooking` — flagged as phase 2, not part of
this spec's scope.

## Testing

- Jest unit tests for the pure status-transition logic (which action —
  en_route / arrived / completed — is valid from which current status).
- Manual QA on a real device for camera, GPS/maps-link, and phone-dial
  behavior — not worth a Detox/E2E harness for a v1 this thin.

## Open questions / deferred decisions

None blocking — the standalone admin web app (`apps/admin`) is
explicitly deferred to its own future spec, as agreed during
brainstorming.

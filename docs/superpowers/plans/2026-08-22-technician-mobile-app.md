# Technician Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an Expo (iOS + Android) app at `apps/mobile` that lets a
logged-in technician see their assigned jobs, update job status
(en route / arrived / completed), and upload before/after photos —
replacing the mobile-web workaround at `apps/web`'s
`(portal)/technician` page.

**Architecture:** Pure client on top of the existing `apps/api` (Hono).
No backend changes. Supabase Auth (same project as `apps/web`) for
login; the app attaches the Supabase JWT as a Bearer token on every API
call. TanStack Query manages server state (fetch/cache/mutate). React
Navigation provides an auth stack (Login) and an app stack (Jobs tab +
Profile tab), switching based on session presence.

**Tech Stack:** Expo (managed, TypeScript), React Navigation,
`@supabase/supabase-js` + `@react-native-async-storage/async-storage`,
`@tanstack/react-query`, `expo-image-picker`. Test runner: `jest-expo` +
`@testing-library/react-native`.

**Spec:** `docs/superpowers/specs/2026-08-22-technician-mobile-app-design.md`

## Global Constraints

- No backend/API changes — all three endpoints already exist and already
  authorize `UserRole.TECHNICIAN` (`GET /v1/technician/jobs`,
  `PATCH /v1/technician/jobs/:id/status`,
  `POST /v1/bookings/:id/attachments`).
- No offline-first sync/retry queue for v1 (spec's explicit non-goal).
- No push notifications for v1 (spec's explicit non-goal, phase 2).
- Package manager is pnpm (root `packageManager: "pnpm@11.28.9"`,
  workspace glob `apps/*` already covers a new `apps/mobile`).
- Env vars use the `EXPO_PUBLIC_` prefix (Expo's equivalent of Next.js's
  `NEXT_PUBLIC_`) — `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`.

---

## File Structure

```
apps/mobile/
  app.json                       # Expo app config
  babel.config.js
  tsconfig.json
  package.json
  jest.config.js
  App.tsx                        # Root: QueryClientProvider + session-based nav switch
  src/
    lib/
      supabase.ts                # Supabase client (AsyncStorage-persisted session)
      bookingStatus.ts           # BookingStatus type + status→label/badge meta (ported from apps/web)
      api.ts                     # fetch wrappers: listJobs, updateJobStatus, uploadAttachment
      api.test.ts                # unit tests for nextActionFor()
      useSession.ts              # hook: current Supabase session + loading state
    navigation/
      RootNavigator.tsx          # switches AuthStack vs AppTabs based on useSession()
    screens/
      LoginScreen.tsx
      JobListScreen.tsx
      JobDetailScreen.tsx
      ProfileScreen.tsx
    components/
      JobCard.tsx
      PhotoUploader.tsx
```

This mirrors `apps/web/src/app/(portal)/technician/page.tsx` and
`apps/web/src/lib/bookingStatus.ts`, which already implement this exact
business logic against the same API — `src/lib/bookingStatus.ts` and the
`nextActionFor` logic in `src/lib/api.ts` are direct ports.

`ponytail:` not extracting `bookingStatus.ts` into a shared package —
it's ~30 lines duplicated across 2 consumers (web, mobile). Extract to
`packages/types` or similar only if a third consumer needs it.

---

### Task 1: Scaffold the Expo app

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/jest.config.js`
- Create: `apps/mobile/App.tsx`
- Create: `apps/mobile/src/lib/__placeholder.ts` (deleted in Task 2 — not created if you'd rather skip; see Step 4)

**Interfaces:**
- Produces: a working `pnpm --filter mobile start` Expo dev server and
  `pnpm --filter mobile test` Jest runner, which every later task builds
  on.

- [ ] **Step 1: Create the Expo project**

Run from the repo root:

```bash
cd apps
npx create-expo-app@latest mobile --template blank-typescript
cd ..
```

This scaffolds `apps/mobile` with `package.json`, `app.json`, `App.tsx`,
`tsconfig.json`, and `babel.config.js` already wired for Expo + TS. It
uses npm internally for the initial scaffold — that's fine, the next
step re-syncs it into the pnpm workspace.

- [ ] **Step 2: Re-lock with pnpm and add test dependencies**

Run:

```bash
pnpm install
pnpm --filter mobile add @tanstack/react-query @supabase/supabase-js @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-image-picker
pnpm --filter mobile add -D jest-expo @testing-library/react-native @types/jest
```

- [ ] **Step 3: Configure Jest**

Edit `apps/mobile/package.json`, add:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest",
    "check-types": "tsc --noEmit"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

- [ ] **Step 4: Verify the scaffold**

Run: `pnpm --filter mobile run check-types`
Expected: exits 0 with no errors (the default `App.tsx` from the
template type-checks cleanly).

Run: `pnpm --filter mobile test`
Expected: "No tests found" is fine at this point — there are no test
files yet. It should NOT error out on config.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile pnpm-lock.yaml
git commit -m "chore: scaffold apps/mobile Expo app"
```

---

### Task 2: Booking status logic + API client (pure TS, TDD)

**Files:**
- Create: `apps/mobile/src/lib/bookingStatus.ts`
- Create: `apps/mobile/src/lib/api.ts`
- Test: `apps/mobile/src/lib/api.test.ts`

**Interfaces:**
- Produces: `type BookingStatus`, `BOOKING_STATUS_META`, and from
  `api.ts`: `nextActionFor(status: BookingStatus): NextAction`,
  `type Job`, `type NextAction`, `listJobs(accessToken: string): Promise<Job[]>`,
  `updateJobStatus(accessToken: string, jobId: string, input: {action, note?, materialsUsed?}): Promise<Job>`,
  `uploadAttachment(accessToken: string, jobId: string, photo: {uri: string; name: string; type: string}, photoType: "BEFORE" | "AFTER"): Promise<void>`.
- Consumes: nothing (pure module + `fetch`, which RN provides globally).

- [ ] **Step 1: Write the failing test for `nextActionFor`**

Create `apps/mobile/src/lib/api.test.ts`:

```typescript
import { nextActionFor } from "./api";

describe("nextActionFor", () => {
  it("returns en_route for a job not yet started", () => {
    expect(nextActionFor("REQUESTED")).toEqual({ action: "en_route", label: "Mark En Route" });
    expect(nextActionFor("CONFIRMED")).toEqual({ action: "en_route", label: "Mark En Route" });
    expect(nextActionFor("ASSIGNED")).toEqual({ action: "en_route", label: "Mark En Route" });
  });

  it("returns arrived once the technician is en route", () => {
    expect(nextActionFor("EN_ROUTE")).toEqual({ action: "arrived", label: "Mark Arrived" });
  });

  it("returns completed once work is in progress", () => {
    expect(nextActionFor("IN_PROGRESS")).toEqual({ action: "completed", label: "Mark Completed" });
  });

  it("returns null once a job is finished or cancelled", () => {
    expect(nextActionFor("COMPLETED")).toBeNull();
    expect(nextActionFor("CANCELLED")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter mobile test src/lib/api.test.ts`
Expected: FAIL — `Cannot find module './api'` (file doesn't exist yet).

- [ ] **Step 3: Create `bookingStatus.ts`** (ported from
  `apps/web/src/lib/bookingStatus.ts`, badge classes dropped since
  there's no Tailwind on the client — the app will use plain style
  objects instead)

```typescript
export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; color: string }> = {
  REQUESTED: { label: "Requested", color: "#9CA3AF" },
  CONFIRMED: { label: "Confirmed", color: "#2563EB" },
  ASSIGNED: { label: "Assigned", color: "#2563EB" },
  EN_ROUTE: { label: "En Route", color: "#D97706" },
  IN_PROGRESS: { label: "In Progress", color: "#D97706" },
  COMPLETED: { label: "Completed", color: "#16A34A" },
  CANCELLED: { label: "Cancelled", color: "#6B7280" },
};
```

- [ ] **Step 4: Create `api.ts`** (ported from the fetch calls in
  `apps/web/src/app/(portal)/technician/page.tsx`)

```typescript
import type { BookingStatus } from "./bookingStatus";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Job = {
  id: string;
  code: string;
  status: BookingStatus;
  scheduledAt: string;
  problemDescription: string;
  service: { title: string } | null;
  property: { addressLine: string; city: string };
  user: { name: string; phone: string | null };
};

export type NextAction = { action: "en_route" | "arrived" | "completed"; label: string } | null;

export function nextActionFor(status: BookingStatus): NextAction {
  switch (status) {
    case "REQUESTED":
    case "CONFIRMED":
    case "ASSIGNED":
      return { action: "en_route", label: "Mark En Route" };
    case "EN_ROUTE":
      return { action: "arrived", label: "Mark Arrived" };
    case "IN_PROGRESS":
      return { action: "completed", label: "Mark Completed" };
    default:
      return null;
  }
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function listJobs(accessToken: string): Promise<Job[]> {
  const res = await fetch(`${API_URL}/v1/technician/jobs`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Could not load jobs");
  return res.json();
}

export async function updateJobStatus(
  accessToken: string,
  jobId: string,
  input: { action: "en_route" | "arrived" | "completed"; note?: string; materialsUsed?: string },
): Promise<Job> {
  const res = await fetch(`${API_URL}/v1/technician/jobs/${jobId}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not update the job");
  }
  return res.json();
}

export async function uploadAttachment(
  accessToken: string,
  jobId: string,
  photo: { uri: string; name: string; type: string },
  photoType: "BEFORE" | "AFTER",
): Promise<void> {
  const formData = new FormData();
  // React Native's FormData accepts this {uri, name, type} shape directly —
  // it is not a real Blob/File, unlike the browser FormData.append("file", File) on web.
  formData.append("file", photo as unknown as Blob);
  formData.append("photoType", photoType);

  const res = await fetch(`${API_URL}/v1/bookings/${jobId}/attachments`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Upload failed");
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter mobile test src/lib/api.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/lib/bookingStatus.ts apps/mobile/src/lib/api.ts apps/mobile/src/lib/api.test.ts
git commit -m "feat(mobile): booking status logic and API client"
```

---

### Task 3: Supabase auth + session hook

**Files:**
- Create: `apps/mobile/src/lib/supabase.ts`
- Create: `apps/mobile/src/lib/useSession.ts`
- Modify: `apps/mobile/app.json` (add `extra.eas` is NOT needed; instead
  document the three required env vars in a new `.env.example`)
- Create: `apps/mobile/.env.example`

**Interfaces:**
- Consumes: nothing new.
- Produces: `supabase` client instance, `useSession(): { session: Session | null; loading: boolean }`
  — Task 4's navigator switches on this.

- [ ] **Step 1: Create `.env.example`**

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

Copy this to `.env` locally and fill in the same Supabase project URL/anon
key and API URL that `apps/web/.env` uses — technicians are `User` rows
in the same Supabase project, not a separate one.

- [ ] **Step 2: Create the Supabase client**

```typescript
// apps/mobile/src/lib/supabase.ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

Run: `pnpm --filter mobile add react-native-url-polyfill` (Supabase's JS
client needs this polyfill on React Native — it has no `URL` global by
default).

- [ ] **Step 3: Create the session hook**

```typescript
// apps/mobile/src/lib/useSession.ts
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
```

- [ ] **Step 4: Write a smoke test**

Create `apps/mobile/src/lib/useSession.test.ts`:

```typescript
import { supabase } from "./supabase";

// This is a config smoke test, not a behavior test — `useSession` itself
// is a thin wrapper over the Supabase SDK, which is already tested upstream.
// What CAN break here is wiring: wrong storage adapter, wrong client shape.
describe("supabase client", () => {
  it("is configured with AsyncStorage-backed session persistence", () => {
    expect(supabase.auth).toBeDefined();
  });
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter mobile test src/lib/useSession.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/lib/supabase.ts apps/mobile/src/lib/useSession.ts apps/mobile/src/lib/useSession.test.ts apps/mobile/.env.example
git commit -m "feat(mobile): Supabase auth client and session hook"
```

---

### Task 4: Navigation shell (auth stack vs app tabs)

**Files:**
- Create: `apps/mobile/src/screens/LoginScreen.tsx`
- Create: `apps/mobile/src/screens/ProfileScreen.tsx` (stub — filled out in Task 7)
- Create: `apps/mobile/src/navigation/RootNavigator.tsx`
- Modify: `apps/mobile/App.tsx`

**Interfaces:**
- Consumes: `useSession()` from Task 3, `supabase` from Task 3.
- Produces: the mounted app shell that Tasks 5–7 add screens into.

- [ ] **Step 1: Create `LoginScreen.tsx`**

```typescript
// apps/mobile/src/screens/LoginScreen.tsx
import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seepage Doctor — Technician</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? "Signing in…" : "Sign in"} onPress={handleLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 12 },
  error: { color: "#DC2626" },
});
```

- [ ] **Step 2: Create a stub `ProfileScreen.tsx`**

```typescript
// apps/mobile/src/screens/ProfileScreen.tsx
import { View, Button, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { useSession } from "../lib/useSession";

export function ProfileScreen() {
  const { session } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.email}>{session?.user.email}</Text>
      <Button title="Log out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  email: { fontSize: 16, color: "#374151" },
});
```

- [ ] **Step 3: Create `RootNavigator.tsx`**

```typescript
// apps/mobile/src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../lib/useSession";
import { LoginScreen } from "../screens/LoginScreen";
import { JobListScreen } from "../screens/JobListScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Jobs" component={JobListScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

This references `JobListScreen`, which Task 5 creates — leave a minimal
placeholder for it now so this task type-checks on its own:

```typescript
// apps/mobile/src/screens/JobListScreen.tsx (placeholder, replaced in Task 5)
import { View, Text } from "react-native";
export function JobListScreen() {
  return (
    <View>
      <Text>Jobs</Text>
    </View>
  );
}
```

- [ ] **Step 4: Wire `App.tsx`**

```typescript
// apps/mobile/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 5: Verify it type-checks and boots**

Run: `pnpm --filter mobile run check-types`
Expected: exits 0.

Run: `pnpm --filter mobile start` then press `i` or `a` (or scan the QR
code with Expo Go) to launch on a simulator/device.
Expected: the Login screen renders; after Task 5+ ship, the manual QA
end of this plan re-verifies the logged-in path.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/App.tsx apps/mobile/src/navigation apps/mobile/src/screens
git commit -m "feat(mobile): navigation shell with auth-gated tabs"
```

---

### Task 5: Job list screen

**Files:**
- Modify: `apps/mobile/src/screens/JobListScreen.tsx` (replace Task 4's placeholder)
- Create: `apps/mobile/src/components/JobCard.tsx`
- Test: `apps/mobile/src/components/JobCard.test.tsx`

**Interfaces:**
- Consumes: `listJobs`, `type Job`, `nextActionFor` from `src/lib/api.ts`
  (Task 2); `useSession` (Task 3); `BOOKING_STATUS_META` (Task 2).
- Produces: `JobCard` component, reused unmodified by Task 6's detail
  screen navigation target.

- [ ] **Step 1: Write a failing render test for `JobCard`**

```typescript
// apps/mobile/src/components/JobCard.test.tsx
import { render, screen } from "@testing-library/react-native";
import { JobCard } from "./JobCard";
import type { Job } from "../lib/api";

const job: Job = {
  id: "1",
  code: "SD-1001",
  status: "ASSIGNED",
  scheduledAt: "2026-08-22T10:00:00.000Z",
  problemDescription: "Leak under kitchen sink",
  service: { title: "Leak Detection" },
  property: { addressLine: "12 MG Road", city: "Bengaluru" },
  user: { name: "Asha Rao", phone: "9999999999" },
};

it("shows the service title, customer, and status label", () => {
  render(<JobCard job={job} onPress={() => {}} />);
  expect(screen.getByText("Leak Detection")).toBeTruthy();
  expect(screen.getByText(/Asha Rao/)).toBeTruthy();
  expect(screen.getByText("Assigned")).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter mobile test src/components/JobCard.test.tsx`
Expected: FAIL — `Cannot find module './JobCard'`.

- [ ] **Step 3: Create `JobCard.tsx`**

```typescript
// apps/mobile/src/components/JobCard.tsx
import { Pressable, View, Text, StyleSheet } from "react-native";
import type { Job } from "../lib/api";
import { BOOKING_STATUS_META } from "../lib/bookingStatus";

export function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const meta = BOOKING_STATUS_META[job.status];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.badge, { backgroundColor: meta.color }]}>
        <Text style={styles.badgeText}>{meta.label}</Text>
      </View>
      <Text style={styles.title}>{job.service?.title ?? "Service Request"}</Text>
      <Text style={styles.subtitle}>{job.code}</Text>
      <Text style={styles.line}>{job.user.name}{job.user.phone ? ` • ${job.user.phone}` : ""}</Text>
      <Text style={styles.line}>{job.property.addressLine}, {job.property.city}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, marginBottom: 12, gap: 4, elevation: 2 },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { color: "#6B7280", fontSize: 12 },
  line: { color: "#374151", fontSize: 13 },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter mobile test src/components/JobCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Build `JobListScreen.tsx`**

```typescript
// apps/mobile/src/screens/JobListScreen.tsx
import { FlatList, RefreshControl, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { listJobs } from "../lib/api";
import { useSession } from "../lib/useSession";
import { JobCard } from "../components/JobCard";

export function JobListScreen() {
  const { session } = useSession();
  const navigation = useNavigation<any>();

  const { data: jobs, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ["technician-jobs"],
    queryFn: () => listJobs(session!.access_token),
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Could not load jobs. Pull down to retry.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={jobs ?? []}
      keyExtractor={(job) => job.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={<Text style={styles.empty}>No jobs assigned to you right now.</Text>}
      renderItem={({ item }) => (
        <JobCard job={item} onPress={() => navigation.navigate("JobDetail", { jobId: item.id })} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 32 },
});
```

Note: this navigates to a `"JobDetail"` route that doesn't exist in the
navigator yet — Task 6 adds it to `RootNavigator.tsx`'s `AppTabs` stack
(wrapping the `Jobs` tab in its own stack navigator so it can push a
detail screen). Task 6, Step 1 makes this concrete.

- [ ] **Step 6: Verify types**

Run: `pnpm --filter mobile run check-types`
Expected: passes except for the as-yet-unregistered `"JobDetail"` route
name, which TypeScript won't catch here since `useNavigation<any>()` is
untyped — this is intentional for this plan's scope (a fully typed
navigator param list is more ceremony than an 8-task v1 needs).

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/src/screens/JobListScreen.tsx apps/mobile/src/components/JobCard.tsx apps/mobile/src/components/JobCard.test.tsx
git commit -m "feat(mobile): job list screen"
```

---

### Task 6: Job detail screen + status updates

**Files:**
- Create: `apps/mobile/src/screens/JobDetailScreen.tsx`
- Modify: `apps/mobile/src/navigation/RootNavigator.tsx` (wrap `Jobs` tab
  in a stack so `JobDetail` can be pushed)
- Test: `apps/mobile/src/screens/JobDetailScreen.test.tsx`

**Interfaces:**
- Consumes: `updateJobStatus`, `nextActionFor`, `type Job` (Task 2);
  `useSession` (Task 3).
- Produces: nothing new consumed by later tasks — Task 7 adds the photo
  uploader as a component embedded directly in this screen.

- [ ] **Step 1: Update `RootNavigator.tsx`'s `AppTabs`**

Replace the `Jobs` tab registration to wrap `JobListScreen` +
`JobDetailScreen` in their own stack, so pushing a detail screen doesn't
leave the tab bar:

```typescript
// apps/mobile/src/navigation/RootNavigator.tsx — replace AppTabs with:
import { JobDetailScreen } from "../screens/JobDetailScreen";

const JobsStack = createNativeStackNavigator();

function JobsStackScreen() {
  return (
    <JobsStack.Navigator>
      <JobsStack.Screen name="JobList" component={JobListScreen} options={{ title: "My Jobs" }} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: "Job Details" }} />
    </JobsStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Jobs" component={JobsStackScreen} options={{ headerShown: false }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
```

- [ ] **Step 2: Write a failing test for the status-action button label**

```typescript
// apps/mobile/src/screens/JobDetailScreen.test.tsx
import { render, screen } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { JobDetailScreen } from "./JobDetailScreen";

jest.mock("../lib/useSession", () => ({
  useSession: () => ({ session: { access_token: "token" }, loading: false }),
}));

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: () => ({
    data: {
      id: "1",
      code: "SD-1001",
      status: "ASSIGNED",
      scheduledAt: "2026-08-22T10:00:00.000Z",
      problemDescription: "Leak under kitchen sink",
      service: { title: "Leak Detection" },
      property: { addressLine: "12 MG Road", city: "Bengaluru" },
      user: { name: "Asha Rao", phone: "9999999999" },
    },
    isLoading: false,
  }),
  useMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({ params: { jobId: "1" } }),
}));

it("shows the next status action for an assigned job", () => {
  render(
    <NavigationContainer>
      <JobDetailScreen />
    </NavigationContainer>,
  );
  expect(screen.getByText("Mark En Route")).toBeTruthy();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter mobile test src/screens/JobDetailScreen.test.tsx`
Expected: FAIL — `Cannot find module './JobDetailScreen'`.

- [ ] **Step 4: Create `JobDetailScreen.tsx`**

```typescript
// apps/mobile/src/screens/JobDetailScreen.tsx
import { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Linking } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listJobs, updateJobStatus, nextActionFor, type Job } from "../lib/api";
import { useSession } from "../lib/useSession";

export function JobDetailScreen() {
  const { params } = useRoute<any>();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["technician-jobs"],
    queryFn: () => listJobs(session!.access_token),
    enabled: !!session,
  });

  const job = jobs?.find((j: Job) => j.id === params.jobId);

  const mutation = useMutation({
    mutationFn: (action: "en_route" | "arrived" | "completed") =>
      updateJobStatus(session!.access_token, params.jobId, {
        action,
        note: note || undefined,
        materialsUsed: action === "completed" ? materialsUsed || undefined : undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["technician-jobs"] }),
  });

  if (isLoading || !job) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const next = nextActionFor(job.status);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{job.service?.title ?? "Service Request"}</Text>
      <Text style={styles.subtitle}>{job.code}</Text>

      <Text style={styles.link} onPress={() => Linking.openURL(`tel:${job.user.phone}`)}>
        {job.user.name}{job.user.phone ? ` • ${job.user.phone}` : ""}
      </Text>
      <Text
        style={styles.link}
        onPress={() =>
          Linking.openURL(
            `https://maps.google.com/?q=${encodeURIComponent(`${job.property.addressLine}, ${job.property.city}`)}`,
          )
        }
      >
        {job.property.addressLine}, {job.property.city}
      </Text>
      <Text style={styles.body}>{job.problemDescription}</Text>

      {next && (
        <View style={styles.actionBlock}>
          <TextInput
            style={styles.input}
            placeholder="Add a note (optional)…"
            value={note}
            onChangeText={setNote}
          />
          {next.action === "completed" && (
            <TextInput
              style={styles.input}
              placeholder="Materials used (optional)…"
              value={materialsUsed}
              onChangeText={setMaterialsUsed}
            />
          )}
          <Button
            title={mutation.isPending ? "Updating…" : next.label}
            onPress={() => mutation.mutate(next.action)}
            disabled={mutation.isPending}
          />
          {mutation.isError && <Text style={styles.error}>{(mutation.error as Error).message}</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#6B7280", marginBottom: 8 },
  link: { color: "#2563EB", fontSize: 14 },
  body: { fontSize: 14, color: "#374151", marginVertical: 8 },
  actionBlock: { marginTop: 16, gap: 8 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 12 },
  error: { color: "#DC2626" },
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter mobile test src/screens/JobDetailScreen.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/screens/JobDetailScreen.tsx apps/mobile/src/screens/JobDetailScreen.test.tsx apps/mobile/src/navigation/RootNavigator.tsx
git commit -m "feat(mobile): job detail screen with status updates"
```

---

### Task 7: Photo upload

**Files:**
- Create: `apps/mobile/src/components/PhotoUploader.tsx`
- Modify: `apps/mobile/src/screens/JobDetailScreen.tsx` (render `PhotoUploader` below the action block)
- Modify: `apps/mobile/app.json` (add the camera/media-library permission strings `expo-image-picker` needs)

**Interfaces:**
- Consumes: `uploadAttachment` (Task 2), `useSession` (Task 3).
- Produces: nothing consumed elsewhere — this is the last screen-level task.

- [ ] **Step 1: Add permission config to `app.json`**

Add inside the top-level `"expo"` object:

```json
"plugins": [
  [
    "expo-image-picker",
    {
      "photosPermission": "Allow Seepage Doctor to access your photos to attach job documentation.",
      "cameraPermission": "Allow Seepage Doctor to use the camera to document job progress."
    }
  ]
]
```

- [ ] **Step 2: Create `PhotoUploader.tsx`**

```typescript
// apps/mobile/src/components/PhotoUploader.tsx
import { useState } from "react";
import { View, Button, Text, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { uploadAttachment } from "../lib/api";
import { useSession } from "../lib/useSession";

export function PhotoUploader({ jobId }: { jobId: string }) {
  const { session } = useSession();
  const [photoType, setPhotoType] = useState<"BEFORE" | "AFTER">("BEFORE");
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) =>
      uploadAttachment(
        session!.access_token,
        jobId,
        { uri: asset.uri, name: asset.fileName ?? "photo.jpg", type: asset.mimeType ?? "image/jpeg" },
        photoType,
      ),
  });

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled) return;

    setPreview(result.assets[0].uri);
    mutation.mutate(result.assets[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Upload a photo</Text>
      <View style={styles.toggleRow}>
        <Button title="Before" onPress={() => setPhotoType("BEFORE")} color={photoType === "BEFORE" ? "#2563EB" : "#9CA3AF"} />
        <Button title="After" onPress={() => setPhotoType("AFTER")} color={photoType === "AFTER" ? "#2563EB" : "#9CA3AF"} />
      </View>
      {preview && <Image source={{ uri: preview }} style={styles.preview} />}
      <Button
        title={mutation.isPending ? "Uploading…" : "Take photo"}
        onPress={pickAndUpload}
        disabled={mutation.isPending}
      />
      {mutation.isError && <Text style={styles.error}>{(mutation.error as Error).message}</Text>}
      {mutation.isSuccess && <Text style={styles.success}>Uploaded.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, gap: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 16 },
  label: { fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 8 },
  preview: { width: 120, height: 120, borderRadius: 8 },
  error: { color: "#DC2626" },
  success: { color: "#16A34A" },
});
```

- [ ] **Step 3: Embed it in `JobDetailScreen.tsx`**

Add the import and render it at the bottom of the `ScrollView`'s content,
after the `actionBlock` view:

```typescript
import { PhotoUploader } from "../components/PhotoUploader";
// ...
      <PhotoUploader jobId={job.id} />
    </ScrollView>
```

- [ ] **Step 4: Verify types**

Run: `pnpm --filter mobile run check-types`
Expected: exits 0.

- [ ] **Step 5: Manual QA (camera access can't be unit-tested)**

On a real device via Expo Go (or a dev build): open a job, tap "Take
photo", confirm the camera opens, take a photo, confirm the preview
shows and "Uploaded." appears. Then check the booking's attachments in
the existing `apps/web` admin view to confirm the photo landed with the
correct `photoType`.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/components/PhotoUploader.tsx apps/mobile/src/screens/JobDetailScreen.tsx apps/mobile/app.json
git commit -m "feat(mobile): photo upload for job documentation"
```

---

### Task 8: Profile screen polish + final manual QA pass

**Files:**
- Modify: `apps/mobile/src/screens/ProfileScreen.tsx` (already functional
  from Task 4 — this task just confirms the full flow end-to-end)

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: nothing further — this is the plan's final task.

- [ ] **Step 1: Full manual QA pass**

With a real `TECHNICIAN`-role user (seed one via
`apps/api/src/scripts/seedAdmin.ts`'s pattern if none exists) and `.env`
pointed at a running `apps/api` instance:

1. Launch the app — confirm it lands on Login (no session yet).
2. Log in — confirm it lands on the Jobs tab with the assigned jobs list.
3. Pull to refresh — confirm the list reloads without error.
4. Open a job — confirm customer/address/service/notes render, and
   tapping the phone number/address opens the dialer/maps app.
5. Tap the status action — confirm the button shows "Updating…", then
   the job's status updates (verify against `apps/web`'s admin view or
   the technician's own `apps/web` `(portal)/technician` page for the
   same account).
6. On an in-progress job, mark it completed with a "materials used"
   note — confirm it moves off the actionable list.
7. Take and upload a before/after photo — confirm success message and
   confirm the photo appears in `apps/web`'s admin attachment list.
8. Log out from Profile — confirm it returns to Login and a subsequent
   app relaunch does NOT auto-log back in.

- [ ] **Step 2: Run the full test suite one more time**

Run: `pnpm --filter mobile test`
Expected: all tests pass (from Tasks 2, 5, 6).

Run: `pnpm --filter mobile run check-types`
Expected: exits 0.

- [ ] **Step 3: Commit** (only if Step 1's QA pass required fixes)

```bash
git add apps/mobile
git commit -m "fix(mobile): address issues found in end-to-end QA pass"
```

---

## Plan Self-Review Notes

- **Spec coverage:** Login (Task 4), Job List (Task 5), Job Detail +
  status updates (Task 6), Photo capture (Task 7), Profile/logout (Task
  4/8) — all five screens from the spec are covered. The three reused
  API endpoints are all exercised (Tasks 5, 6, 7). The spec's declared
  non-goals (offline queue, push notifications) are intentionally absent
  — no task should add them.
- **Type consistency:** `Job`, `NextAction`, and `BookingStatus` are
  defined once in Task 2 and imported everywhere else (Tasks 5, 6, 7) —
  no redefinition.
- **No placeholders:** the one placeholder file
  (`JobListScreen.tsx` stub in Task 4) is explicitly replaced by name in
  Task 5, Step 1 — flagged so an executor doesn't mistake it for done.

import type { Context, Next } from "hono";
import { prisma, UserRole, type User } from "@repo/database";
import { supabaseAdmin } from "../lib/supabase.js";

export type AuthUser = User;

export type AuthEnv = {
  Variables: {
    user: AuthUser;
  };
};

async function upsertUserFromSupabase(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<AuthUser> {
  const email = supabaseUser.email ?? "";
  const name =
    (supabaseUser.user_metadata?.full_name as string | undefined) ??
    (supabaseUser.user_metadata?.name as string | undefined) ??
    email.split("@")[0] ??
    "User";

  return prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    update: { email },
    create: {
      supabaseId: supabaseUser.id,
      email,
      name,
      role: UserRole.CUSTOMER,
    },
  });
}

export async function requireAuth(c: Context<AuthEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return c.json({ error: "Missing bearer token" }, 401);
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  const user = await upsertUserFromSupabase(data.user);
  c.set("user", user);

  await next();
}

export function requireRole(...roles: UserRole[]) {
  return async (c: Context<AuthEnv>, next: Next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
}

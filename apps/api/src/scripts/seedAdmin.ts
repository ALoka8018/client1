import "dotenv/config";
import { prisma, UserRole } from "@repo/database";
import { supabaseAdmin } from "../lib/supabase.js";

const email = process.env.ADMIN_EMAIL ?? "admin@plumbingallsolution.test";
const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
const name = process.env.ADMIN_NAME ?? "Admin";
const role = process.env.ADMIN_ROLE === "ADMIN" ? UserRole.ADMIN : UserRole.SUPER_ADMIN;

async function getOrCreateSupabaseUser() {
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!createError) return created.user;

  // Already exists — look it up instead.
  const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw createError;

  await supabaseAdmin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
  return existing;
}

async function main() {
  const supabaseUser = await getOrCreateSupabaseUser();

  await prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    update: { role, email, name },
    create: { supabaseId: supabaseUser.id, email, name, role },
  });

  console.log(`Admin ready — email: ${email}, password: ${password}, role: ${role}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

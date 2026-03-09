/**
 * Create test users via Supabase Admin API (no direct auth table writes).
 * Run: node --env-file=.env.local scripts/create-test-users-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Need Supabase URL and service role key in .env.local:");
  console.error("  VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  console.error("  SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard → Settings → API)");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";
const TEST_USERS = [
  { email: "admin@test.com", full_name: "Admin User", role: "admin" },
  { email: "editor@test.com", full_name: "Editor User", role: "editor" },
  { email: "member@test.com", full_name: "Member User", role: "member" },
  { email: "viewer@test.com", full_name: "Viewer User", role: "viewer" },
];
const PASSWORD = "Test1234";

// Ensure workspace exists
const { error: wsErr } = await supabase.from("workspaces").upsert(
  { id: WORKSPACE_ID, name: "Test Workspace", slug: "test", updated_at: new Date().toISOString() },
  { onConflict: "id" }
);
if (wsErr) console.warn("Workspace upsert:", wsErr.message);

for (const u of TEST_USERS) {
  let uid = null;
  const { data: userData, error: authErr } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  });

  if (authErr) {
    if (authErr.message?.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((x) => x.email === u.email);
      if (existing) {
        uid = existing.id;
        await supabase.auth.admin.updateUserById(uid, { password: PASSWORD });
        console.log("Updated password for", u.email);
      }
    } else {
      console.error(u.email, "auth:", authErr.message);
      continue;
    }
  } else {
    uid = userData?.user?.id;
    if (uid) console.log("Created", u.email);
  }

  if (!uid) {
    const { data: list } = await supabase.auth.admin.listUsers();
    uid = list?.users?.find((x) => x.email === u.email)?.id;
  }
  if (!uid) {
    console.warn("No user id for", u.email);
    continue;
  }

  await supabase.from("profiles").upsert(
    { id: uid, email: u.email, full_name: u.full_name, role: u.role, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  await supabase.from("workspace_members").upsert(
    { workspace_id: WORKSPACE_ID, user_id: uid, role: u.role, updated_at: new Date().toISOString() },
    { onConflict: "workspace_id,user_id" }
  );
}

console.log("Done. Try login: admin@test.com / Test1234");

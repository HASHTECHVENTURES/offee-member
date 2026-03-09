/**
 * Small API server so the Admin panel can create members (no hardcoded seed).
 * Run: node --env-file=.env.local server/create-member-server.mjs
 * With Vite proxy (see vite.config.ts), "Add member" in Admin panel will work.
 */
import http from "http";
import { createClient } from "@supabase/supabase-js";

const port = Number(process.env.CREATE_MEMBER_PORT) || 3002;
const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const DEFAULT_ROLES = [
  { name: "Admin", slug: "admin", can_access_admin_panel: true, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" },
  { name: "CEO", slug: "ceo", can_access_admin_panel: false, can_manage_okrs: true, can_manage_key_results: true, dashboard_type: "ceo" },
  { name: "Leader", slug: "leader", can_access_admin_panel: false, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" },
  { name: "HR", slug: "hr", can_access_admin_panel: false, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" },
  { name: "Member", slug: "member", can_access_admin_panel: false, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" },
];

async function ensureDefaultRoles(supabaseClient, workspaceId) {
  const now = new Date().toISOString();
  for (const r of DEFAULT_ROLES) {
    const { error } = await supabaseClient
      .from("roles")
      .upsert(
        {
          workspace_id: workspaceId,
          name: r.name,
          slug: r.slug,
          can_access_admin_panel: r.can_access_admin_panel,
          can_manage_okrs: r.can_manage_okrs,
          can_manage_key_results: r.can_manage_key_results,
          dashboard_type: r.dashboard_type,
          updated_at: now,
        },
        { onConflict: "workspace_id,slug" }
      );
    if (error) return error.message;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method !== "POST" || req.url !== "/api/create-member") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  let body = "";
  try {
    for await (const chunk of req) body += chunk;
  } catch (readErr) {
    console.error("Read body error:", readErr);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: readErr?.message || "Failed to read request" }));
    return;
  }
  try {
    const data = JSON.parse(body || "{}");
    const { email, full_name, designation, password, workspace_id, role_id, role_slug } = data;
    if (!email || typeof email !== "string" || !email.trim()) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "email is required" }));
      return;
    }
    const passwordVal = (password && typeof password === "string") ? password : "";
    const wsId = (workspace_id && String(workspace_id).trim()) || null;
    if (!wsId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "workspace_id is required" }));
      return;
    }

    const { data: wsRow, error: wsErr } = await supabase.from("workspaces").select("id").eq("id", wsId).maybeSingle();
    if (wsErr || !wsRow?.id) {
      const msg = wsErr?.message || "Workspace not found. Use a valid workspace_id from your workspace list.";
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: msg }));
      return;
    }

    const fullNameVal = (full_name && String(full_name).trim()) || null;
    const designationVal = (designation && String(designation).trim()) || null;
    const emailNorm = email.trim().toLowerCase();

    let uid = null;
    let existingUserEmail = null;

    // 1) Check if a user with this email already exists (profile or auth)
    const { data: profileRow } = await supabase.from("profiles").select("id").eq("email", emailNorm).maybeSingle();
    if (profileRow?.id) {
      uid = profileRow.id;
      existingUserEmail = emailNorm;
    }

    // 2) If no existing profile, try to create a new auth user (requires password)
    if (!uid) {
      if (!passwordVal || passwordVal.length < 6) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Password is required for new users (min 6 characters)" }));
        return;
      }
      const { data: userData, error: authErr } = await supabase.auth.admin.createUser({
        email: emailNorm,
        password: passwordVal,
        email_confirm: true,
        user_metadata: { full_name: fullNameVal, designation: designationVal },
      });

      if (authErr) {
        // If "already registered", find the existing user and add them to the workspace
        if (authErr.message && /already|registered|exists/i.test(authErr.message)) {
          const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const existing = listData?.users?.find((u) => (u.email || "").toLowerCase() === emailNorm);
          if (existing?.id) {
            uid = existing.id;
            existingUserEmail = existing.email;
          }
        }
        if (!uid) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: authErr.message || "Failed to create user" }));
          return;
        }
      } else {
        uid = userData?.user?.id;
        existingUserEmail = userData?.user?.email;
        if (!uid) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User created but no id returned" }));
          return;
        }
      }
    }

    const emailForProfile = existingUserEmail || emailNorm;
    const now = new Date().toISOString();
    const profilePayload = {
      id: uid,
      email: emailForProfile,
      full_name: fullNameVal || emailForProfile?.split("@")[0] || null,
      role: "member",
      updated_at: now,
    };
    const { error: profileErr } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
    if (profileErr) {
      console.error("Profiles upsert error:", profileErr);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: profileErr.message || "Failed to save profile" }));
      return;
    }
    if (designationVal) {
      const { error: titleErr } = await supabase.from("profiles").update({ leader_title: designationVal, updated_at: now }).eq("id", uid);
      if (titleErr) {
        console.warn("Optional leader_title update skipped:", titleErr.message);
      }
    }

    let resolvedRoleId = null;
    if (role_id && typeof role_id === "string" && role_id.trim()) {
      const { data: roleRow } = await supabase
        .from("roles")
        .select("id")
        .eq("id", role_id.trim())
        .eq("workspace_id", wsId)
        .maybeSingle();
      if (roleRow?.id) resolvedRoleId = roleRow.id;
    }
    if (!resolvedRoleId && role_slug && typeof role_slug === "string" && role_slug.trim()) {
      const err = await ensureDefaultRoles(supabase, wsId);
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err }));
        return;
      }
      const { data: roleBySlug } = await supabase
        .from("roles")
        .select("id")
        .eq("workspace_id", wsId)
        .eq("slug", role_slug.trim().toLowerCase())
        .maybeSingle();
      if (roleBySlug?.id) resolvedRoleId = roleBySlug.id;
    }
    const clientSentRole = (role_id && String(role_id).trim()) || (role_slug && String(role_slug).trim());
    if (!resolvedRoleId) {
      const err = await ensureDefaultRoles(supabase, wsId);
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err }));
        return;
      }
      const { data: memberRole } = await supabase
        .from("roles")
        .select("id")
        .eq("workspace_id", wsId)
        .eq("slug", "member")
        .limit(1);
      resolvedRoleId = memberRole?.[0]?.id ?? null;
    }
    if (clientSentRole && !resolvedRoleId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Could not resolve the selected role. Check that the workspace has roles." }));
      return;
    }

    const { error: memberErr } = await supabase.from("workspace_members").upsert(
      {
        workspace_id: wsId,
        user_id: uid,
        role: "member",
        status: "active",
        role_id: resolvedRoleId,
        updated_at: now,
      },
      { onConflict: "workspace_id,user_id" }
    );
    if (memberErr) {
      console.error("workspace_members upsert error:", memberErr);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: memberErr.message || "Failed to add member to workspace" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, user_id: uid, email: emailForProfile }));
  } catch (e) {
    const msg = e?.message || "Server error";
    console.error("Create-member error:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: msg }));
  }
});

server.listen(port, () => {
  console.log(`Create-member API at http://localhost:${port}`);
});

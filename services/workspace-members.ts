import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceMember, WorkspaceMemberInsert, MemberWithProfile, Role } from "@/types";
import { getProfileById } from "./users";
import { getRoles } from "./roles";

const TABLE = "workspace_members";

export type WorkspaceRole = "admin" | "editor" | "viewer" | "member";

export async function getMembers(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; user_id?: string }
) {
  let query = supabase.from(TABLE).select("id, workspace_id, user_id, role, status, role_id, created_at, updated_at");
  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load workspace members");
  return (data ?? []) as WorkspaceMember[];
}

export async function getMember(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string
): Promise<WorkspaceMember | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Failed to load member");
  return data as WorkspaceMember | null;
}

export async function addMember(
  supabase: SupabaseClient,
  payload: WorkspaceMemberInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to add member");
  return data as WorkspaceMember;
}

export async function updateMemberRole(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ role, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update member role");
  return data as WorkspaceMember;
}

export async function setMemberStatus(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
  status: "pending" | "active"
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update member status");
  return data as WorkspaceMember;
}

export async function updateMemberRoleId(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
  roleId: string | null
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update member role");
  return data as WorkspaceMember;
}

export async function getMembersWithProfilesAndRoles(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<MemberWithProfile[]> {
  const [members, roles] = await Promise.all([
    getMembers(supabase, { workspace_id: workspaceId }),
    getRoles(supabase, { workspace_id: workspaceId }),
  ]);
  const roleMap = new Map<string, Role>(roles.map((r: Role) => [r.id, r]));
  const result: MemberWithProfile[] = [];
  for (const m of members) {
    const profile = await getProfileById(supabase, m.user_id).catch(() => null);
    const roleRecord = m.role_id ? (roleMap.get(m.role_id) ?? null) : null;
    result.push({ ...m, profile: profile ?? null, roleRecord: roleRecord ?? null });
  }
  return result;
}

export async function removeMember(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string
) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message ?? "Failed to remove member");
}

export function canEdit(role: WorkspaceRole): boolean {
  return role === "admin" || role === "editor" || role === "member";
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return role === "admin";
}

export function canDelete(role: WorkspaceRole): boolean {
  return role === "admin";
}

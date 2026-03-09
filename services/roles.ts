import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role, RoleInsert } from "@/types";

const TABLE = "roles";

export async function getRoles(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string }
) {
  let query = supabase.from(TABLE).select("*").order("name");
  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load roles");
  return (data ?? []) as Role[];
}

export async function getRoleById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load role");
  return data as Role;
}

export async function createRole(supabase: SupabaseClient, payload: RoleInsert) {
  const slug = (payload.slug ?? payload.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")).slice(0, 64);
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, slug, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create role");
  return data as Role;
}

export async function updateRole(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<RoleInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update role");
  return data as Role;
}

export async function deleteRole(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete role");
}

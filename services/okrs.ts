import type { SupabaseClient } from "@supabase/supabase-js";
import type { OKR, OKRInsert } from "@/types";

const TABLE = "okrs";

export async function getOkrs(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; status?: OKR["status"] }
) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load OKRs");
  return (data ?? []) as OKR[];
}

export async function getOkrById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load OKR");
  return data as OKR;
}

export async function createOkr(supabase: SupabaseClient, payload: OKRInsert) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create OKR");
  return data as OKR;
}

export async function updateOkr(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<OKRInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update OKR");
  return data as OKR;
}

export async function deleteOkr(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete OKR");
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Decision, DecisionInsert } from "@/types";

const TABLE = "decisions";

export async function getDecisions(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; status?: Decision["status"] }
) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load decisions");
  return (data ?? []) as Decision[];
}

export async function getDecisionById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load decision");
  return data as Decision;
}

export async function createDecision(
  supabase: SupabaseClient,
  payload: DecisionInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create decision");
  return data as Decision;
}

export async function updateDecision(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<DecisionInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update decision");
  return data as Decision;
}

export async function deleteDecision(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete decision");
}

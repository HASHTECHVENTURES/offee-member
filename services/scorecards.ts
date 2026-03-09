import type { SupabaseClient } from "@supabase/supabase-js";
import type { Scorecard, ScorecardInsert } from "@/types";

const TABLE = "scorecards";

export async function getScorecards(
  supabase: SupabaseClient,
  workspaceId?: string
) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load scorecards");
  return (data ?? []) as Scorecard[];
}

export async function getScorecardById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load scorecard");
  return data as Scorecard;
}

export async function createScorecard(
  supabase: SupabaseClient,
  payload: ScorecardInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create scorecard");
  return data as Scorecard;
}

export async function updateScorecard(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<ScorecardInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update scorecard");
  return data as Scorecard;
}

export async function deleteScorecard(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete scorecard");
}

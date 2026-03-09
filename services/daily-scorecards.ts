import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyScorecard, DailyScorecardInsert } from "@/types";

const TABLE = "daily_scorecards";

export async function getDailyScorecards(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; from?: string; to?: string }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("submitted_at", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.from) {
    query = query.gte("submitted_at", filters.from);
  }
  if (filters?.to) {
    query = query.lte("submitted_at", filters.to);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load scorecards");
  return (data ?? []) as DailyScorecard[];
}

export async function getDailyScorecardById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message ?? "Failed to load scorecard");
  return data as DailyScorecard;
}

export async function getDailyScorecardByDate(
  supabase: SupabaseClient,
  workspaceId: string,
  date: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("submitted_at", date)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Failed to load scorecard by date");
  return data as DailyScorecard | null;
}

export async function createDailyScorecard(
  supabase: SupabaseClient,
  payload: DailyScorecardInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create scorecard");
  return data as DailyScorecard;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyKRScorecard, WeeklyKRScorecardInsert } from "@/types";

const TABLE = "weekly_kr_scorecards";

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export async function getWeeklyKRScorecards(
  supabase: SupabaseClient,
  filters?: {
    key_result_id?: string;
    dri_id?: string;
    week_start?: string;
    from?: string;
    to?: string;
  }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("week_start", { ascending: false });

  if (filters?.key_result_id) {
    query = query.eq("key_result_id", filters.key_result_id);
  }
  if (filters?.dri_id) {
    query = query.eq("dri_id", filters.dri_id);
  }
  if (filters?.week_start) {
    query = query.eq("week_start", filters.week_start);
  }
  if (filters?.from) {
    query = query.gte("week_start", filters.from);
  }
  if (filters?.to) {
    query = query.lte("week_start", filters.to);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load weekly scorecards");
  return (data ?? []) as WeeklyKRScorecard[];
}

export async function getWeeklyKRScorecardById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message ?? "Failed to load weekly scorecard");
  return data as WeeklyKRScorecard;
}

export async function getWeeklyKRScorecardByKRAndWeek(
  supabase: SupabaseClient,
  keyResultId: string,
  weekStart: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("key_result_id", keyResultId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Failed to load weekly scorecard");
  return data as WeeklyKRScorecard | null;
}

export async function createWeeklyKRScorecard(
  supabase: SupabaseClient,
  payload: WeeklyKRScorecardInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create weekly scorecard");
  return data as WeeklyKRScorecard;
}

export async function updateWeeklyKRScorecard(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<WeeklyKRScorecardInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update weekly scorecard");
  return data as WeeklyKRScorecard;
}

export async function upsertWeeklyKRScorecard(
  supabase: SupabaseClient,
  payload: WeeklyKRScorecardInsert
) {
  const existing = await getWeeklyKRScorecardByKRAndWeek(
    supabase,
    payload.key_result_id,
    payload.week_start
  );
  if (existing) {
    return updateWeeklyKRScorecard(supabase, existing.id, payload);
  }
  return createWeeklyKRScorecard(supabase, payload);
}

export async function deleteWeeklyKRScorecard(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete weekly scorecard");
}

export async function getDRIScorecardSummary(
  supabase: SupabaseClient,
  driId: string,
  weekStart: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      id,
      key_result_id,
      output_value,
      pipeline_value,
      quality_value,
      notes,
      blocker_decision_id,
      key_results (id, title, target_value, current_value, okr_id)
    `)
    .eq("dri_id", driId)
    .eq("week_start", weekStart);
  if (error) throw new Error(error.message ?? "Failed to load DRI summary");
  return data ?? [];
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyLeaderScorecard, DailyLeaderScorecardInsert } from "@/types";

const TABLE = "daily_leader_scorecards";

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getDailyScorecards(
  supabase: SupabaseClient,
  filters?: {
    workspace_id?: string;
    leader_id?: string;
    date?: string;
    from_date?: string;
    to_date?: string;
  }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("scorecard_date", { ascending: false });

  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.leader_id) query = query.eq("leader_id", filters.leader_id);
  if (filters?.date) query = query.eq("scorecard_date", filters.date);
  if (filters?.from_date) query = query.gte("scorecard_date", filters.from_date);
  if (filters?.to_date) query = query.lte("scorecard_date", filters.to_date);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load daily scorecards");
  return (data ?? []) as DailyLeaderScorecard[];
}

export async function getTodayScorecard(
  supabase: SupabaseClient,
  leaderId: string
): Promise<DailyLeaderScorecard | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("leader_id", leaderId)
    .eq("scorecard_date", getTodayDate())
    .maybeSingle();

  if (error) throw new Error(error.message ?? "Failed to load today's scorecard");
  return data as DailyLeaderScorecard | null;
}

export async function upsertDailyScorecard(
  supabase: SupabaseClient,
  payload: DailyLeaderScorecardInsert
) {
  const existing = await supabase
    .from(TABLE)
    .select("id")
    .eq("workspace_id", payload.workspace_id)
    .eq("leader_id", payload.leader_id)
    .eq("scorecard_date", payload.scorecard_date)
    .maybeSingle();

  if (existing.data) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", existing.data.id)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to update scorecard");
    return data as DailyLeaderScorecard;
  } else {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to create scorecard");
    return data as DailyLeaderScorecard;
  }
}

export async function getLeaderComplianceStats(
  supabase: SupabaseClient,
  leaderId: string,
  monthStart: string
) {
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  const { data, error } = await supabase
    .from(TABLE)
    .select("scorecard_date, submitted_at")
    .eq("leader_id", leaderId)
    .gte("scorecard_date", monthStart)
    .lte("scorecard_date", monthEnd.toISOString().split("T")[0]);

  if (error) throw new Error(error.message ?? "Failed to load compliance stats");

  const scorecards = data ?? [];
  const workingDays = getWorkingDaysInMonth(monthStart);
  const submitted = scorecards.filter((s) => s.submitted_at).length;
  const compliance = workingDays > 0 ? Math.round((submitted / workingDays) * 100) : 0;

  return { submitted, workingDays, compliance };
}

function getWorkingDaysInMonth(monthStart: string): number {
  const start = new Date(monthStart);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0) count++; // Mon-Sat
    current.setDate(current.getDate() + 1);
  }
  return count;
}

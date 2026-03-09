import type { SupabaseClient } from "@supabase/supabase-js";
import type { MonthlyPerformanceScore, MonthlyPerformanceScoreInsert } from "@/types";

const TABLE = "monthly_performance_scores";

export function getMonthStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export async function getPerformanceScores(
  supabase: SupabaseClient,
  filters?: {
    workspace_id?: string;
    leader_id?: string;
    month_start?: string;
    from_month?: string;
    to_month?: string;
  }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("month_start", { ascending: false });

  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.leader_id) query = query.eq("leader_id", filters.leader_id);
  if (filters?.month_start) query = query.eq("month_start", filters.month_start);
  if (filters?.from_month) query = query.gte("month_start", filters.from_month);
  if (filters?.to_month) query = query.lte("month_start", filters.to_month);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load performance scores");
  return (data ?? []) as MonthlyPerformanceScore[];
}

export async function upsertPerformanceScore(
  supabase: SupabaseClient,
  payload: MonthlyPerformanceScoreInsert
) {
  const existing = await supabase
    .from(TABLE)
    .select("id")
    .eq("workspace_id", payload.workspace_id)
    .eq("leader_id", payload.leader_id)
    .eq("month_start", payload.month_start)
    .maybeSingle();

  if (existing.data) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", existing.data.id)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to update score");
    return data as MonthlyPerformanceScore;
  } else {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to create score");
    return data as MonthlyPerformanceScore;
  }
}

export async function getQuarterAverageScore(
  supabase: SupabaseClient,
  leaderId: string,
  quarterStart: string
): Promise<number> {
  const quarterEnd = new Date(quarterStart);
  quarterEnd.setMonth(quarterEnd.getMonth() + 3);
  quarterEnd.setDate(0);

  const { data, error } = await supabase
    .from(TABLE)
    .select("total_score, has_black_event")
    .eq("leader_id", leaderId)
    .gte("month_start", quarterStart)
    .lt("month_start", quarterEnd.toISOString().split("T")[0]);

  if (error) throw new Error(error.message ?? "Failed to load quarter scores");

  const scores = data ?? [];
  if (scores.length === 0) return 0;

  // If any BLACK event, return 0 (disqualified)
  if (scores.some((s) => s.has_black_event)) return 0;

  const total = scores.reduce((sum, s) => sum + (s.total_score ?? 0), 0);
  return Math.round((total / scores.length) * 10) / 10;
}

export function getRewardTier(quarterAvgScore: number): {
  tier: string;
  amount: number;
} | null {
  if (quarterAvgScore >= 95) return { tier: "≥95", amount: 100000 };
  if (quarterAvgScore >= 90) return { tier: "≥90", amount: 50000 };
  return null;
}

export function getPenaltyTrigger(score: MonthlyPerformanceScore): {
  trigger: "lop" | "pip" | null;
  reason: string;
} {
  if (score.has_black_event && score.black_events_count >= 2) {
    return { trigger: "pip", reason: "2 BLACK events in 60 days" };
  }
  if (score.total_score < 85) {
    return { trigger: "lop", reason: `Monthly score ${score.total_score} < 85` };
  }
  return { trigger: null, reason: "" };
}

export async function getLeaderRankings(
  supabase: SupabaseClient,
  workspaceId: string,
  monthStart: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("month_start", monthStart)
    .order("total_score", { ascending: false });

  if (error) throw new Error(error.message ?? "Failed to load rankings");
  return (data ?? []) as MonthlyPerformanceScore[];
}

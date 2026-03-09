import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyKRTracking, WeeklyKRTrackingInsert } from "@/types";

const TABLE = "weekly_kr_tracking";

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export function getMonthStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export function getWeeksRemainingInMonth(date: Date = new Date()): number {
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const today = new Date(date);
  const daysRemaining = Math.max(0, monthEnd.getDate() - today.getDate());
  return Math.ceil(daysRemaining / 7);
}

export function calculateRAGStatus(achievementPct: number): "green" | "amber" | "red" | "black" {
  if (achievementPct >= 100) return "green";
  if (achievementPct >= 80) return "amber";
  return "red";
}

export function calculateCatchUp(gap: number, remainingWeeks: number): number {
  if (remainingWeeks <= 0 || gap <= 0) return 0;
  return Math.round((gap / remainingWeeks) * 100) / 100;
}

export async function getWeeklyTracking(
  supabase: SupabaseClient,
  filters?: {
    key_result_id?: string;
    week_start?: string;
    from_week?: string;
    to_week?: string;
  }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("week_start", { ascending: false });

  if (filters?.key_result_id) query = query.eq("key_result_id", filters.key_result_id);
  if (filters?.week_start) query = query.eq("week_start", filters.week_start);
  if (filters?.from_week) query = query.gte("week_start", filters.from_week);
  if (filters?.to_week) query = query.lte("week_start", filters.to_week);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load weekly tracking");
  return (data ?? []) as WeeklyKRTracking[];
}

export async function upsertWeeklyTracking(
  supabase: SupabaseClient,
  payload: WeeklyKRTrackingInsert
) {
  const achievementPct = payload.weekly_target > 0
    ? Math.round((payload.actual / payload.weekly_target) * 100 * 10) / 10
    : 0;
  const gap = payload.weekly_target > payload.actual ? payload.weekly_target - payload.actual : 0;
  const catchUpAdd = calculateCatchUp(gap, payload.remaining_weeks);
  const nextWeekTarget = payload.weekly_target + catchUpAdd;
  const ragStatus = calculateRAGStatus(achievementPct);

  const enrichedPayload = {
    ...payload,
    catch_up_add: catchUpAdd,
    next_week_target: nextWeekTarget,
    rag_status: ragStatus,
  };

  const existing = await supabase
    .from(TABLE)
    .select("id")
    .eq("key_result_id", payload.key_result_id)
    .eq("week_start", payload.week_start)
    .maybeSingle();

  if (existing.data) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...enrichedPayload, updated_at: new Date().toISOString() })
      .eq("id", existing.data.id)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to update tracking");
    return data as WeeklyKRTracking;
  } else {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(enrichedPayload)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to create tracking");
    return data as WeeklyKRTracking;
  }
}

export async function getKRRunRateData(
  supabase: SupabaseClient,
  krId: string,
  monthTarget: number,
  weeksInMonth: number
) {
  const weekStart = getWeekStart();
  const weeklyTarget = weeksInMonth > 0 ? monthTarget / weeksInMonth : 0;
  const remainingWeeks = getWeeksRemainingInMonth();

  const tracking = await getWeeklyTracking(supabase, {
    key_result_id: krId,
    week_start: weekStart,
  });

  const current = tracking[0];
  const actual = current?.actual ?? 0;
  const gap = weeklyTarget > actual ? weeklyTarget - actual : 0;
  const catchUpAdd = calculateCatchUp(gap, remainingWeeks);
  const nextWeekTarget = weeklyTarget + catchUpAdd;
  const achievementPct = weeklyTarget > 0 ? Math.round((actual / weeklyTarget) * 100 * 10) / 10 : 0;
  const ragStatus = calculateRAGStatus(achievementPct);

  return {
    weeklyTarget,
    actual,
    achievementPct,
    gap,
    remainingWeeks,
    catchUpAdd,
    nextWeekTarget,
    ragStatus,
  };
}

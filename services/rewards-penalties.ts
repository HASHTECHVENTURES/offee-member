import type { SupabaseClient } from "@supabase/supabase-js";
import type { Reward, RewardInsert, Penalty, PenaltyInsert } from "@/types";

const REWARDS_TABLE = "rewards";
const PENALTIES_TABLE = "penalties";

// ============================================================================
// REWARDS
// ============================================================================

export async function getRewards(
  supabase: SupabaseClient,
  filters?: {
    workspace_id?: string;
    leader_id?: string;
    reward_type?: Reward["reward_type"];
    status?: Reward["status"];
  }
) {
  let query = supabase
    .from(REWARDS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.leader_id) query = query.eq("leader_id", filters.leader_id);
  if (filters?.reward_type) query = query.eq("reward_type", filters.reward_type);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load rewards");
  return (data ?? []) as Reward[];
}

export async function createReward(
  supabase: SupabaseClient,
  payload: RewardInsert
) {
  const { data, error } = await supabase
    .from(REWARDS_TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create reward");
  return data as Reward;
}

export async function updateRewardStatus(
  supabase: SupabaseClient,
  id: string,
  status: Reward["status"]
) {
  const { data, error } = await supabase
    .from(REWARDS_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update reward");
  return data as Reward;
}

// ============================================================================
// PENALTIES
// ============================================================================

export async function getPenalties(
  supabase: SupabaseClient,
  filters?: {
    workspace_id?: string;
    leader_id?: string;
    penalty_type?: Penalty["penalty_type"];
    status?: Penalty["status"];
  }
) {
  let query = supabase
    .from(PENALTIES_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.leader_id) query = query.eq("leader_id", filters.leader_id);
  if (filters?.penalty_type) query = query.eq("penalty_type", filters.penalty_type);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load penalties");
  return (data ?? []) as Penalty[];
}

export async function createPenalty(
  supabase: SupabaseClient,
  payload: PenaltyInsert
) {
  const { data, error } = await supabase
    .from(PENALTIES_TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create penalty");
  return data as Penalty;
}

export async function updatePenaltyStatus(
  supabase: SupabaseClient,
  id: string,
  status: Penalty["status"]
) {
  const { data, error } = await supabase
    .from(PENALTIES_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update penalty");
  return data as Penalty;
}

export function getLOPDays(occurrenceCount: number): number {
  if (occurrenceCount === 1) return 3;
  if (occurrenceCount === 2) return 5;
  if (occurrenceCount === 3) return 7;
  return 7; // 4th+ triggers PIP
}

export async function getLeaderLOPCount(
  supabase: SupabaseClient,
  leaderId: string,
  withinMonths: number = 6
): Promise<number> {
  const since = new Date();
  since.setMonth(since.getMonth() - withinMonths);

  const { data, error } = await supabase
    .from(PENALTIES_TABLE)
    .select("id")
    .eq("leader_id", leaderId)
    .eq("penalty_type", "lop")
    .gte("created_at", since.toISOString());

  if (error) return 0;
  return data?.length ?? 0;
}

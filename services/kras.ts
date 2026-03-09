import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  KeyResponsibilityArea,
  KeyResponsibilityAreaInsert,
  LeaderKRA,
  LeaderKRAInsert,
} from "@/types";

const KRA_TABLE = "key_responsibility_areas";
const LEADER_KRA_TABLE = "leader_kras";
const MAX_KRAS_PER_LEADER = 3;

export async function getKRAs(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string }
) {
  let query = supabase.from(KRA_TABLE).select("*").order("name");
  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load KRAs");
  return (data ?? []) as KeyResponsibilityArea[];
}

export async function getKRAById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(KRA_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message ?? "Failed to load KRA");
  return data as KeyResponsibilityArea;
}

export async function createKRA(
  supabase: SupabaseClient,
  payload: KeyResponsibilityAreaInsert
) {
  const { data, error } = await supabase
    .from(KRA_TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create KRA");
  return data as KeyResponsibilityArea;
}

export async function updateKRA(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<KeyResponsibilityAreaInsert>
) {
  const { data, error } = await supabase
    .from(KRA_TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update KRA");
  return data as KeyResponsibilityArea;
}

export async function deleteKRA(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(KRA_TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete KRA");
}

export async function getLeaderKRAs(
  supabase: SupabaseClient,
  filters?: { leader_id?: string; kra_id?: string }
) {
  let query = supabase.from(LEADER_KRA_TABLE).select("*");
  if (filters?.leader_id) {
    query = query.eq("leader_id", filters.leader_id);
  }
  if (filters?.kra_id) {
    query = query.eq("kra_id", filters.kra_id);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load leader KRAs");
  return (data ?? []) as LeaderKRA[];
}

export async function assignKRAToLeader(
  supabase: SupabaseClient,
  payload: LeaderKRAInsert
) {
  const existing = await getLeaderKRAs(supabase, { leader_id: payload.leader_id });
  if (existing.length >= MAX_KRAS_PER_LEADER) {
    throw new Error(`Leader already has ${MAX_KRAS_PER_LEADER} KRAs (max allowed)`);
  }
  if (existing.some((lk) => lk.kra_id === payload.kra_id)) {
    throw new Error("Leader already assigned to this KRA");
  }
  const { data, error } = await supabase
    .from(LEADER_KRA_TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to assign KRA");
  return data as LeaderKRA;
}

export async function unassignKRAFromLeader(
  supabase: SupabaseClient,
  leaderId: string,
  kraId: string
) {
  const { error } = await supabase
    .from(LEADER_KRA_TABLE)
    .delete()
    .eq("leader_id", leaderId)
    .eq("kra_id", kraId);
  if (error) throw new Error(error.message ?? "Failed to unassign KRA");
}

export async function getLeadersWithKRAs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(LEADER_KRA_TABLE)
    .select(`
      leader_id,
      kra_id,
      assigned_at,
      key_responsibility_areas (id, name, description)
    `);
  if (error) throw new Error(error.message ?? "Failed to load leaders with KRAs");
  return data ?? [];
}

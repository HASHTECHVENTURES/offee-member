import type { SupabaseClient } from "@supabase/supabase-js";
import type { KRCheckIn, KRCheckInInsert } from "@/types";

const TABLE = "kr_check_ins";

export async function getCheckIns(
  supabase: SupabaseClient,
  filters?: { key_result_id?: string; user_id?: string; limit?: number }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.key_result_id) {
    query = query.eq("key_result_id", filters.key_result_id);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load check-ins");
  return (data ?? []) as KRCheckIn[];
}

export async function createCheckIn(
  supabase: SupabaseClient,
  payload: KRCheckInInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create check-in");
  return data as KRCheckIn;
}

export async function getCheckInsByKRIds(
  supabase: SupabaseClient,
  krIds: string[],
  since?: string
) {
  if (krIds.length === 0) return [];
  let query = supabase
    .from(TABLE)
    .select("*")
    .in("key_result_id", krIds)
    .order("created_at", { ascending: false });

  if (since) {
    query = query.gte("created_at", since);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load check-ins");
  return (data ?? []) as KRCheckIn[];
}

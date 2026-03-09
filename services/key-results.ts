import type { SupabaseClient } from "@supabase/supabase-js";
import type { KeyResult, KeyResultInsert } from "@/types";

const TABLE = "key_results";

export async function getKeyResults(
  supabase: SupabaseClient,
  filters?: { okr_id?: string; status?: KeyResult["status"]; dri_id?: string }
) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

  if (filters?.okr_id) {
    query = query.eq("okr_id", filters.okr_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.dri_id) {
    query = query.eq("dri_id", filters.dri_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load key results");
  return (data ?? []) as KeyResult[];
}

/** Lightweight check: does this user have any key results where they are DRI? (for nav visibility) */
export async function hasKeyResultsAsDri(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id")
    .eq("dri_id", userId)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function getKeyResultById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load key result");
  return data as KeyResult;
}

export async function createKeyResult(
  supabase: SupabaseClient,
  payload: KeyResultInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create key result");
  return data as KeyResult;
}

export async function updateKeyResult(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<KeyResultInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update key result");
  return data as KeyResult;
}

export async function deleteKeyResult(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete key result");
}

/** Get key result counts per OKR id (for list views). */
export async function getKeyResultCountByOkrIds(
  supabase: SupabaseClient,
  okrIds: string[]
): Promise<Record<string, number>> {
  if (okrIds.length === 0) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("okr_id")
    .in("okr_id", okrIds);
  if (error) throw new Error(error.message ?? "Failed to load key result counts");
  const count: Record<string, number> = {};
  okrIds.forEach((id) => (count[id] = 0));
  (data ?? []).forEach((row: { okr_id: string }) => {
    count[row.okr_id] = (count[row.okr_id] ?? 0) + 1;
  });
  return count;
}

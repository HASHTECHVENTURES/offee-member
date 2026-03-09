import type { SupabaseClient } from "@supabase/supabase-js";
import type { Quarter, QuarterInsert } from "@/types";

const TABLE = "quarters";

export async function getQuarters(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; status?: Quarter["status"] }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("start_date", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load quarters");
  return (data ?? []) as Quarter[];
}

export async function getQuarterById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message ?? "Failed to load quarter");
  return data as Quarter;
}

export async function getActiveQuarter(
  supabase: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Failed to load active quarter");
  return data as Quarter | null;
}

export async function createQuarter(
  supabase: SupabaseClient,
  payload: QuarterInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create quarter");
  return data as Quarter;
}

export async function updateQuarter(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<QuarterInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update quarter");
  return data as Quarter;
}

export async function closeQuarter(supabase: SupabaseClient, id: string) {
  return updateQuarter(supabase, id, { status: "closed" });
}

export async function deleteQuarter(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete quarter");
}

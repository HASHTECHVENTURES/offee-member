import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile, UserProfileInsert } from "@/types";

const TABLE = "profiles";

export async function getProfiles(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string }
) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load profiles");
  return (data ?? []) as UserProfile[];
}

export async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load profile");
  return data as UserProfile;
}

export async function getProfileByEmail(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Failed to load profile by email");
  return data as UserProfile | null;
}

export async function upsertProfile(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<UserProfileInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { id, ...payload, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to upsert profile");
  return data as UserProfile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<UserProfileInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update profile");
  return data as UserProfile;
}

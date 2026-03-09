import type { SupabaseClient } from "@supabase/supabase-js";
import type { Team, TeamInsert } from "@/types";

const TABLE = "teams";

export async function getTeams(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string }
) {
  let query = supabase.from(TABLE).select("*").order("name");
  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load teams");
  return (data ?? []) as Team[];
}

export async function getTeamById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message ?? "Failed to load team");
  return data as Team;
}

export async function createTeam(
  supabase: SupabaseClient,
  payload: TeamInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create team");
  return data as Team;
}

export async function updateTeam(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<TeamInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update team");
  return data as Team;
}

export async function deleteTeam(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete team");
}

export async function getTeamMembers(supabase: SupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("team_id", teamId);
  if (error) throw new Error(error.message ?? "Failed to load team members");
  return data ?? [];
}

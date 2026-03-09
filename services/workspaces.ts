import type { SupabaseClient } from "@supabase/supabase-js";
import type { Workspace } from "@/types";

const TABLE = "workspaces";

export async function getWorkspaces(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name");
  if (error) throw new Error(error.message ?? "Failed to load workspaces");
  return (data ?? []) as Workspace[];
}

export async function getWorkspaceById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load workspace");
  return data as Workspace;
}

export async function createWorkspace(
  supabase: SupabaseClient,
  payload: { name: string; slug?: string | null }
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: payload.name,
      slug: payload.slug ?? (payload.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || null),
    })
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create workspace");
  return data as Workspace;
}

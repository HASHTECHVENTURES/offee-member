import type { SupabaseClient } from "@supabase/supabase-js";
import type { Comment, CommentInsert } from "@/types";

const TABLE = "comments";

export async function getComments(
  supabase: SupabaseClient,
  filters: { entity_type: Comment["entity_type"]; entity_id: string }
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("entity_type", filters.entity_type)
    .eq("entity_id", filters.entity_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message ?? "Failed to load comments");
  return (data ?? []) as Comment[];
}

export async function createComment(
  supabase: SupabaseClient,
  payload: CommentInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create comment");
  return data as Comment;
}

export async function updateComment(
  supabase: SupabaseClient,
  id: string,
  content: string
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update comment");
  return data as Comment;
}

export async function deleteComment(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete comment");
}

export async function getRecentComments(
  supabase: SupabaseClient,
  workspaceId: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message ?? "Failed to load recent comments");
  return (data ?? []) as Comment[];
}

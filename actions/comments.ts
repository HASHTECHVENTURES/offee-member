import { supabase } from "@/lib/supabase-browser";
import { commentService } from "@/services";
import type { Comment } from "@/types";

export async function addCommentAction(
  entityType: Comment["entity_type"],
  entityId: string,
  content: string,
  userId: string | null
) {
  try {
    if (!userId) return { error: "Not authenticated" };
    await commentService.createComment(supabase, {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      content,
    });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to add comment" };
  }
}

export async function deleteCommentAction(id: string) {
  try {
    await commentService.deleteComment(supabase, id);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete comment" };
  }
}

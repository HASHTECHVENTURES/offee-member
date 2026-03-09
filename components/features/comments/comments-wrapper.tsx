import { CommentsSection } from "./comments-section";
import { addCommentAction, deleteCommentAction } from "@/actions/comments";
import type { Comment, UserProfile } from "@/types";

interface CommentsWrapperProps {
  entityType: Comment["entity_type"];
  entityId: string;
  comments: Comment[];
  profiles: UserProfile[];
  currentUserId: string | null;
}

export function CommentsWrapper({
  entityType,
  entityId,
  comments,
  profiles,
  currentUserId,
}: CommentsWrapperProps) {
  async function handleAddComment(content: string) {
    return addCommentAction(entityType, entityId, content, currentUserId);
  }

  async function handleDeleteComment(id: string) {
    return deleteCommentAction(id);
  }

  return (
    <CommentsSection
      entityType={entityType}
      entityId={entityId}
      comments={comments}
      profiles={profiles}
      currentUserId={currentUserId}
      onAddComment={handleAddComment}
      onDeleteComment={handleDeleteComment}
    />
  );
}

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2, Trash2, User } from "lucide-react";
import type { Comment, UserProfile } from "@/types";

interface CommentsSectionProps {
  entityType: Comment["entity_type"];
  entityId: string;
  comments: Comment[];
  profiles: UserProfile[];
  currentUserId: string | null;
  onAddComment: (content: string) => Promise<{ error: string | null }>;
  onDeleteComment: (id: string) => Promise<{ error: string | null }>;
  onSuccess?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentsSection({
  entityType,
  entityId,
  comments,
  profiles,
  currentUserId,
  onAddComment,
  onDeleteComment,
  onSuccess,
}: CommentsSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(() => {
      void (async () => {
        const result = await onAddComment(content.trim());
        if (result.error) toast.error(result.error);
        else {
          setContent("");
          onSuccess?.();
        }
      })();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    startTransition(() => {
      void (async () => {
        const result = await onDeleteComment(id);
        if (result.error) toast.error(result.error);
        else onSuccess?.();
      })();
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <MessageSquare className="size-4" />
        Discussion ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">No comments yet. Start the discussion.</p>
      ) : (
        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
          {comments.map((comment) => {
            const author = profileMap.get(comment.user_id);
            const isOwn = comment.user_id === currentUserId;

            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {author?.full_name || author?.email?.split("@")[0] || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                    {isOwn && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        disabled={isPending}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 text-sm"
        />
        <Button type="submit" size="sm" disabled={isPending || !content.trim()} className="shrink-0">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}

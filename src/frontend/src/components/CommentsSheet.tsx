import type { CommentView } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import {
  useAddComment,
  useComments,
  useToggleCommentLike,
} from "@/hooks/useFeed";
import { formatCount, formatRelativeTime, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Heart, Send } from "lucide-react";
import { useState } from "react";

interface CommentsSheetProps {
  reelId: bigint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequireAuth: () => void;
}

function CommentRow({
  comment,
  onLike,
  disabled,
}: {
  comment: CommentView;
  onLike: () => void;
  disabled: boolean;
}) {
  return (
    <li data-ocid="comments.item" className="flex items-start gap-3 py-3">
      <Avatar className="size-9 shrink-0">
        {comment.authorAvatarUrl ? (
          <AvatarImage
            src={comment.authorAvatarUrl}
            alt={comment.authorDisplayName}
          />
        ) : null}
        <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
          {initials(comment.authorDisplayName || comment.authorUsername)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            @{comment.authorUsername}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground/90">
          {comment.text}
        </p>
      </div>

      <button
        type="button"
        data-ocid="comments.like_button"
        aria-label={comment.isLiked ? "Unlike comment" : "Like comment"}
        aria-pressed={comment.isLiked}
        disabled={disabled}
        onClick={onLike}
        className="flex shrink-0 flex-col items-center gap-0.5 rounded-full px-1 py-1 outline-none transition-smooth hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <Heart
          className={cn(
            "size-4",
            comment.isLiked
              ? "fill-primary text-primary"
              : "text-muted-foreground",
          )}
        />
        <span className="text-[10px] font-medium text-muted-foreground">
          {formatCount(comment.likeCount)}
        </span>
      </button>
    </li>
  );
}

/**
 * Bottom sheet listing a reel's comments with an inline composer. New comments
 * appear immediately at the top; individual comments can be liked.
 */
export function CommentsSheet({
  reelId,
  open,
  onOpenChange,
  onRequireAuth,
}: CommentsSheetProps) {
  const { auth } = useApp();
  const commentsQuery = useComments(open ? reelId : null);
  const addComment = useAddComment();
  const toggleLike = useToggleCommentLike();
  const [draft, setDraft] = useState("");

  const comments = commentsQuery.data ?? [];
  const canInteract = auth.isAuthenticated;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canInteract) {
      onRequireAuth();
      return;
    }
    const text = draft.trim();
    if (!text || reelId === null) return;
    setDraft("");
    addComment.mutate(
      { reelId, text },
      {
        onError: () => setDraft((current) => (current === "" ? text : current)),
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        data-ocid="comments.sheet"
        className="h-[75dvh] gap-0 rounded-t-3xl border-border bg-card p-0"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-center font-display text-base">
            {comments.length > 0
              ? `${formatCount(comments.length)} comments`
              : "Comments"}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {commentsQuery.isLoading ? (
            <ul className="py-3">
              {Array.from({ length: 4 }, (_, i) => `comment-skeleton-${i}`).map(
                (id) => (
                  <li key={id} className="flex items-start gap-3 py-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </li>
                ),
              )}
            </ul>
          ) : comments.length === 0 ? (
            <div
              data-ocid="comments.empty_state"
              className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-2xl">
                💬
              </span>
              <p className="font-display text-base font-semibold text-foreground">
                No comments yet
              </p>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Be the first to share what you think about this reel.
              </p>
            </div>
          ) : (
            <ul data-ocid="comments.list" className="divide-y divide-border">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id.toString()}
                  comment={comment}
                  disabled={!canInteract || toggleLike.isPending}
                  onLike={() => {
                    if (!canInteract) {
                      onRequireAuth();
                      return;
                    }
                    toggleLike.mutate(comment.id);
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            data-ocid="comments.input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={() => {
              if (!canInteract) onRequireAuth();
            }}
            placeholder={canInteract ? "Add a comment…" : "Sign in to comment"}
            aria-label="Add a comment"
            className="h-11 min-w-0 flex-1 rounded-full border border-input bg-secondary/60 px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            data-ocid="comments.submit_button"
            size="icon"
            aria-label="Post comment"
            disabled={!draft.trim() || addComment.isPending}
            className="size-11 shrink-0 rounded-full"
          >
            <Send className="size-5" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

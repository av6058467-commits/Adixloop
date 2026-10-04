import type { Draft } from "@/backend";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/format";
import { FileVideo, Pencil, Trash2 } from "lucide-react";

interface DraftsListProps {
  drafts: Draft[];
  isLoading: boolean;
  onResume: (draft: Draft) => void;
  onDelete: (draftId: bigint) => void;
  deletingId: bigint | null;
}

/**
 * Saved drafts surfaced inside the create flow. Each row can be resumed into
 * the editor or deleted permanently.
 */
export function DraftsList({
  drafts,
  isLoading,
  onResume,
  onDelete,
  deletingId,
}: DraftsListProps) {
  if (isLoading) {
    return (
      <div data-ocid="create.drafts_loading_state" className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => `draft-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-20 w-full rounded-2xl" />
          ),
        )}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div
        data-ocid="create.drafts_empty_state"
        className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
          <FileVideo
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
        </span>
        <div className="space-y-1">
          <p className="font-display text-base font-semibold text-foreground">
            No drafts yet
          </p>
          <p className="text-sm text-muted-foreground">
            Save a reel as a draft and it will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul data-ocid="create.drafts_list" className="space-y-3">
      {drafts.map((draft, index) => (
        <li
          key={draft.id.toString()}
          data-ocid={`create.draft_item.${index + 1}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
        >
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
            {draft.thumbnailUrl ? (
              <img
                src={draft.thumbnailUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <FileVideo
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {draft.caption.trim() || "Untitled reel"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {draft.hashtags.length > 0
                ? draft.hashtags.map((tag) => `#${tag}`).join(" ")
                : "No hashtags"}
            </p>
            <p className="text-xs text-muted-foreground">
              Edited {formatRelativeTime(draft.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Resume draft"
              data-ocid={`create.resume_draft_button.${index + 1}`}
              className="rounded-full text-accent hover:text-accent"
              onClick={() => onResume(draft)}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete draft"
              data-ocid={`create.delete_draft_button.${index + 1}`}
              className="rounded-full text-destructive hover:text-destructive"
              disabled={deletingId === draft.id}
              onClick={() => onDelete(draft.id)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

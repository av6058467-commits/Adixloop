import type { ReelView } from "@/backend";
import { createActor } from "@/lib/backend";
import { formatCount } from "@/lib/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

interface ReelGridProps {
  /** Reel ids to render, in display order. */
  reelIds: bigint[];
  /** Optional empty-state copy when there are no reels. */
  emptyMessage?: string;
  /** data-ocid prefix for the grid and its items. */
  ocid?: string;
}

/**
 * Three-column thumbnail grid of reels. Each tile links into the feed at that
 * reel (`/?reel=<id>`), matching the "reel results open directly into the feed"
 * requirement. Reel views are fetched individually so the grid works for any
 * id list (search, sound, hashtag).
 */
export function ReelGrid({
  reelIds,
  emptyMessage = "No reels yet.",
  ocid = "reel_grid",
}: ReelGridProps) {
  const { actor, isFetching } = useActor(createActor);

  const results = useQueries({
    queries: reelIds.map((id) => ({
      queryKey: ["reel", id.toString()],
      queryFn: async (): Promise<ReelView | null> => {
        if (!actor) return null;
        return actor.getReel(id);
      },
      enabled: !!actor && !isFetching,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const reels = results
    .map((r) => r.data)
    .filter((r): r is ReelView => r != null);

  if (reelIds.length === 0) {
    return (
      <div
        data-ocid={`${ocid}.empty_state`}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Play className="size-5" aria-hidden="true" />
        </span>
        <p className="font-display text-sm font-semibold text-foreground">
          Nothing here yet
        </p>
        <p className="max-w-[16rem] text-xs text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  if (isLoading && reels.length === 0) {
    const skeletonIds = Array.from(
      { length: Math.min(reelIds.length, 9) },
      (_, i) => `reel-skeleton-${i}`,
    );
    return (
      <div
        data-ocid={`${ocid}.loading_state`}
        className="grid grid-cols-3 gap-1"
      >
        {skeletonIds.map((id) => (
          <div
            key={id}
            className="aspect-[9/16] animate-pulse rounded-lg bg-secondary"
          />
        ))}
      </div>
    );
  }

  return (
    <ul data-ocid={ocid} className="grid grid-cols-3 gap-1">
      {reels.map((reel, index) => (
        <li key={reel.id.toString()}>
          <Link
            to="/"
            search={{ reel: reel.id.toString() }}
            data-ocid={`${ocid}.item.${index + 1}`}
            aria-label={`Open reel by ${reel.creatorDisplayName}`}
            className="group relative block aspect-[9/16] overflow-hidden rounded-lg bg-secondary"
          >
            {reel.thumbnailUrl ? (
              <img
                src={reel.thumbnailUrl}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="size-full bg-gradient-subtle" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[11px] font-semibold text-white">
              <Play className="size-3 fill-current" aria-hidden="true" />
              {formatCount(reel.likeCount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

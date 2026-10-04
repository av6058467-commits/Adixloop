import { Layout } from "@/components/Layout";
import { ReelGrid } from "@/components/ReelGrid";
import { createActor } from "@/lib/backend";
import { formatCount, normalizeHashtag } from "@/lib/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Hash } from "lucide-react";

/** Reels for a given hashtag. */
export function HashtagPage() {
  const { tag } = useParams({ from: "/hashtag/$tag" });
  const normalized = normalizeHashtag(tag);
  const { actor, isFetching } = useActor(createActor);

  const reelsQuery = useQuery({
    queryKey: ["reels-by-hashtag", normalized],
    queryFn: async (): Promise<bigint[]> => {
      if (!actor) return [];
      return actor.reelsByHashtag(normalized);
    },
    enabled: !!actor && !isFetching,
  });

  const reelIds = reelsQuery.data ?? [];

  return (
    <Layout title="Hashtag" back>
      <div data-ocid="hashtag.page" className="flex flex-col gap-4">
        <header className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Hash className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold text-foreground">
              #{normalized}
            </h1>
            <p className="text-xs text-muted-foreground">
              {reelsQuery.isLoading
                ? "Loading reels…"
                : `${formatCount(reelIds.length)} reels`}
            </p>
          </div>
        </header>

        <ReelGrid
          reelIds={reelIds}
          ocid="hashtag.reel_grid"
          emptyMessage="No reels use this hashtag yet."
        />
      </div>
    </Layout>
  );
}

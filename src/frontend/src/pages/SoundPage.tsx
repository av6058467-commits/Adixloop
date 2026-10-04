import { Layout } from "@/components/Layout";
import { ReelGrid } from "@/components/ReelGrid";
import { createActor } from "@/lib/backend";
import { formatCount } from "@/lib/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Music2 } from "lucide-react";

/** Reels using a given sound. */
export function SoundPage() {
  const { label } = useParams({ from: "/sound/$label" });
  const { actor, isFetching } = useActor(createActor);

  const reelsQuery = useQuery({
    queryKey: ["reels-by-sound", label],
    queryFn: async (): Promise<bigint[]> => {
      if (!actor) return [];
      return actor.reelsBySound(label);
    },
    enabled: !!actor && !isFetching,
  });

  const reelIds = reelsQuery.data ?? [];

  return (
    <Layout title="Sound" back>
      <div data-ocid="sound.page" className="flex flex-col gap-4">
        <header className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Music2 className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold text-foreground">
              {label}
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
          ocid="sound.reel_grid"
          emptyMessage="No reels use this sound yet."
        />
      </div>
    </Layout>
  );
}

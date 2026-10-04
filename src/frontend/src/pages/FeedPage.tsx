import type { ReelView } from "@/backend";
import { CommentsSheet } from "@/components/CommentsSheet";
import { Layout } from "@/components/Layout";
import { ReelCard } from "@/components/ReelCard";
import { ShareSheet } from "@/components/ShareSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import {
  type FeedTab,
  useFollowingFeed,
  useForYouFeed,
  useReel,
  useToggleReelLike,
} from "@/hooks/useFeed";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

const TABS: { id: FeedTab; label: string }[] = [
  { id: "foryou", label: "For You" },
  { id: "following", label: "Following" },
];

function FeedSkeleton() {
  return (
    <div
      data-ocid="feed.loading_state"
      className="flex h-dvh w-full items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-12 rounded-full bg-white/10" />
        <Skeleton className="h-3 w-32 bg-white/10" />
      </div>
    </div>
  );
}

function FeedEmpty({ tab }: { tab: FeedTab }) {
  return (
    <div
      data-ocid="feed.empty_state"
      className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-background px-8 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-3xl">
        🎬
      </span>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {tab === "following" ? "Nothing from your circle yet" : "No reels yet"}
      </h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        {tab === "following"
          ? "Follow creators to see their latest reels here."
          : "Be the first to post a reel and light up the feed."}
      </p>
    </div>
  );
}

/**
 * Full-screen vertical reels feed. One reel per viewport with snap scrolling,
 * For You / Following tabs, autoplay of the active reel, and like/comment/share
 * actions. Signed-out visitors can browse but are prompted to sign in to act.
 */
export function FeedPage() {
  const navigate = useNavigate();
  const { auth } = useApp();
  const { reel: reelParam } = useSearch({ from: "/" });
  const [tab, setTab] = useState<FeedTab>("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likePulses, setLikePulses] = useState<Record<string, number>>({});
  const [commentsReelId, setCommentsReelId] = useState<bigint | null>(null);
  const [shareReelId, setShareReelId] = useState<bigint | null>(null);

  const forYouQuery = useForYouFeed();
  const followingQuery = useFollowingFeed();
  const toggleLike = useToggleReelLike();

  // A `?reel=<id>` deep link (e.g. from a profile grid or search result) opens
  // the feed at that reel. Parse it defensively — a malformed id is ignored.
  const targetReelId = useMemo<bigint | null>(() => {
    if (!reelParam) return null;
    try {
      return BigInt(reelParam);
    } catch {
      return null;
    }
  }, [reelParam]);

  const activeQuery = tab === "foryou" ? forYouQuery : followingQuery;
  const feedReels = useMemo<ReelView[]>(
    () => activeQuery.data ?? [],
    [activeQuery.data],
  );

  // Fetch the deep-linked reel directly so it can be shown even when it is not
  // part of the currently loaded feed page.
  const targetQuery = useReel(targetReelId);
  const reels = useMemo<ReelView[]>(() => {
    const target = targetQuery.data;
    if (!target) return feedReels;
    if (feedReels.some((reel) => reel.id === target.id)) return feedReels;
    return [target, ...feedReels];
  }, [feedReels, targetQuery.data]);

  const containerRef = useRef<HTMLDivElement>(null);
  const reelCount = reels.length;
  const appliedDeepLinkRef = useRef<string | null>(null);

  // Reset scroll position and active index when switching tabs.
  useEffect(() => {
    // `tab` is read here so the effect re-runs on tab change.
    void tab;
    setActiveIndex(0);
    containerRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  // Open the feed at the deep-linked reel once it is available. Applied once
  // per target id so a later manual tab switch is not overridden.
  useEffect(() => {
    if (targetReelId === null) return;
    const key = targetReelId.toString();
    if (appliedDeepLinkRef.current === key) return;
    const index = reels.findIndex((reel) => reel.id === targetReelId);
    if (index < 0) return;
    appliedDeepLinkRef.current = key;
    setActiveIndex(index);
    const container = containerRef.current;
    const item = container?.querySelector<HTMLElement>(
      `[data-index="${index}"]`,
    );
    item?.scrollIntoView({ block: "start" });
  }, [targetReelId, reels]);

  // Track which reel is centered so only it plays. Re-runs when the tab or the
  // number of rendered reels changes.
  useEffect(() => {
    // `tab` and `reelCount` are read here so the observer re-attaches when the
    // rendered set of reels changes.
    void tab;
    void reelCount;
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? "0",
            );
            setActiveIndex(index);
          }
        }
      },
      { root: container, threshold: 0.6 },
    );
    const items = container.querySelectorAll("[data-index]");
    for (const item of items) observer.observe(item);
    return () => observer.disconnect();
  }, [tab, reelCount]);

  const requireAuth = () => {
    void navigate({ to: "/login" });
  };

  const handleLike = (reel: ReelView) => {
    if (!auth.isAuthenticated) {
      requireAuth();
      return;
    }
    setLikePulses((pulses) => ({
      ...pulses,
      [reel.id.toString()]: (pulses[reel.id.toString()] ?? 0) + 1,
    }));
    toggleLike.mutate(reel.id);
  };

  const handleComment = (reel: ReelView) => {
    if (!auth.isAuthenticated) {
      requireAuth();
      return;
    }
    setCommentsReelId(reel.id);
  };

  const handleShare = (reel: ReelView) => {
    if (!auth.isAuthenticated) {
      requireAuth();
      return;
    }
    setShareReelId(reel.id);
  };

  return (
    <Layout hideHeader fullBleed contentClassName="p-0">
      <div data-ocid="feed.page" className="relative h-dvh bg-black">
        {/* Top tabs */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-4">
          <div
            data-ocid="feed.tabs"
            className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/40 p-1 backdrop-blur-md"
          >
            {TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-ocid={`feed.tab.${item.id}`}
                  aria-pressed={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 font-display text-sm font-semibold transition-smooth focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Snap-scroll reel list */}
        <div
          ref={containerRef}
          data-ocid="feed.list"
          className="snap-reel no-scrollbar h-dvh w-full overflow-y-scroll"
        >
          {activeQuery.isLoading ? (
            <FeedSkeleton />
          ) : reels.length === 0 ? (
            <FeedEmpty tab={tab} />
          ) : (
            reels.map((reel, index) => (
              <div key={reel.id.toString()} data-index={index}>
                <ReelCard
                  reel={reel}
                  isActive={index === activeIndex}
                  isLiked={reel.isLiked}
                  likeCount={reel.likeCount}
                  commentCount={reel.commentCount}
                  likePulse={likePulses[reel.id.toString()] ?? 0}
                  onLike={() => handleLike(reel)}
                  onComment={() => handleComment(reel)}
                  onShare={() => handleShare(reel)}
                />
              </div>
            ))
          )}
        </div>

        {/* Signed-out prompt */}
        {!auth.isAuthenticated && reels.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-card/90 py-2 pl-4 pr-2 backdrop-blur-xl">
              <span className="text-xs text-muted-foreground">
                Sign in to like, comment & share
              </span>
              <Button
                type="button"
                size="sm"
                data-ocid="feed.signin_button"
                onClick={requireAuth}
                className="rounded-full"
              >
                Sign in
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <CommentsSheet
        reelId={commentsReelId}
        open={commentsReelId !== null}
        onOpenChange={(open) => {
          if (!open) setCommentsReelId(null);
        }}
        onRequireAuth={requireAuth}
      />

      <ShareSheet
        reelId={shareReelId}
        open={shareReelId !== null}
        onOpenChange={(open) => {
          if (!open) setShareReelId(null);
        }}
        onRequireAuth={requireAuth}
      />
    </Layout>
  );
}

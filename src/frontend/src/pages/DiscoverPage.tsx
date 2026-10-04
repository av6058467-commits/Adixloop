import { SearchFilter, type SearchResults } from "@/backend";
import { Layout } from "@/components/Layout";
import { ReelGrid } from "@/components/ReelGrid";
import { UserResultRow } from "@/components/UserResultRow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createActor } from "@/lib/backend";
import { formatCount, normalizeHashtag } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hash, Music2, Search, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";

type FilterKey = "all" | "users" | "reels" | "sounds" | "hashtags";

const FILTERS: { key: FilterKey; label: string; value: SearchFilter }[] = [
  { key: "all", label: "All", value: SearchFilter.all },
  { key: "users", label: "Users", value: SearchFilter.users },
  { key: "reels", label: "Reels", value: SearchFilter.reels },
  { key: "sounds", label: "Sounds", value: SearchFilter.sounds },
  { key: "hashtags", label: "Hashtags", value: SearchFilter.hashtags },
];

const EMPTY_RESULTS: SearchResults = {
  hashtags: [],
  sounds: [],
  users: [],
  reels: [],
};

/** Search & discover: search bar, filter tabs, and trending hashtags. */
export function DiscoverPage() {
  const { actor, isFetching } = useActor(createActor);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const trimmed = term.trim();
  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  const searchQuery = useQuery({
    queryKey: ["search", activeFilter.value, trimmed],
    queryFn: async (): Promise<SearchResults> => {
      if (!actor) return EMPTY_RESULTS;
      return actor.search(activeFilter.value, trimmed);
    },
    enabled: !!actor && !isFetching && trimmed.length > 0,
  });

  const trendingQuery = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.trendingHashtags(10n);
    },
    enabled: !!actor && !isFetching,
  });

  const results = searchQuery.data ?? EMPTY_RESULTS;
  const hasResults =
    results.users.length > 0 ||
    results.reels.length > 0 ||
    results.sounds.length > 0 ||
    results.hashtags.length > 0;

  const showUsers = filter === "all" || filter === "users";
  const showReels = filter === "all" || filter === "reels";
  const showSounds = filter === "all" || filter === "sounds";
  const showHashtags = filter === "all" || filter === "hashtags";

  const trending = useMemo(
    () => trendingQuery.data ?? [],
    [trendingQuery.data],
  );

  return (
    <Layout title="Discover">
      <div data-ocid="discover.page" className="flex flex-col gap-5">
        {/* Search bar */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search people, reels, sounds, tags"
            aria-label="Search"
            data-ocid="discover.search_input"
            className="h-11 rounded-full border-border bg-card pl-9 pr-9 text-sm"
          />
          {term.length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              data-ocid="discover.clear_button"
              onClick={() => setTerm("")}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {/* Filter tabs */}
        <div
          role="tablist"
          aria-label="Search filters"
          data-ocid="discover.filter.tab"
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                data-ocid={`discover.filter.${f.key}`}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-smooth",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.66_0.28_357/0.45)]"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {trimmed.length > 0 ? (
          <div className="flex flex-col gap-5">
            {searchQuery.isLoading ? (
              <div
                data-ocid="discover.loading_state"
                className="flex flex-col gap-2"
              >
                {Array.from(
                  { length: 4 },
                  (_, i) => `search-skeleton-${i}`,
                ).map((id) => (
                  <div
                    key={id}
                    className="h-16 animate-pulse rounded-2xl bg-secondary"
                  />
                ))}
              </div>
            ) : !hasResults ? (
              <div
                data-ocid="discover.empty_state"
                className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Search className="size-5" aria-hidden="true" />
                </span>
                <p className="font-display text-sm font-semibold text-foreground">
                  No results for “{trimmed}”
                </p>
                <p className="max-w-[16rem] text-xs text-muted-foreground">
                  Try a different name, sound, or hashtag.
                </p>
              </div>
            ) : (
              <>
                {showUsers && results.users.length > 0 ? (
                  <section className="flex flex-col gap-2">
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      People
                    </h2>
                    <div className="flex flex-col gap-2">
                      {results.users.map((user, index) => (
                        <UserResultRow
                          key={user.toText()}
                          userId={user}
                          ocid={`discover.user.${index + 1}`}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {showReels && results.reels.length > 0 ? (
                  <section className="flex flex-col gap-2">
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      Reels
                    </h2>
                    <ReelGrid
                      reelIds={results.reels}
                      ocid="discover.reel_grid"
                      emptyMessage="No reels matched this search."
                    />
                  </section>
                ) : null}

                {showSounds && results.sounds.length > 0 ? (
                  <section className="flex flex-col gap-2">
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      Sounds
                    </h2>
                    <ul className="flex flex-col gap-2">
                      {results.sounds.map((sound, index) => (
                        <li key={sound.soundLabel}>
                          <Link
                            to="/sound/$label"
                            params={{ label: sound.soundLabel }}
                            data-ocid={`discover.sound.${index + 1}`}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-smooth hover:border-accent/60"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                              <Music2 className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-sm font-semibold text-foreground">
                                {sound.soundLabel}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {formatCount(sound.reelCount)} reels
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {showHashtags && results.hashtags.length > 0 ? (
                  <section className="flex flex-col gap-2">
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      Hashtags
                    </h2>
                    <ul className="flex flex-col gap-2">
                      {results.hashtags.map((tag, index) => (
                        <li key={tag.tag}>
                          <Link
                            to="/hashtag/$tag"
                            params={{ tag: normalizeHashtag(tag.tag) }}
                            data-ocid={`discover.hashtag.${index + 1}`}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-smooth hover:border-accent/60"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                              <Hash className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-sm font-semibold text-foreground">
                                #{normalizeHashtag(tag.tag)}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {formatCount(tag.reelCount)} reels
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            )}
          </div>
        ) : (
          /* Trending hashtags (default view) */
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold text-foreground">
                Trending hashtags
              </h2>
            </div>

            {trendingQuery.isLoading ? (
              <div
                data-ocid="discover.trending.loading_state"
                className="flex flex-wrap gap-2"
              >
                {Array.from(
                  { length: 6 },
                  (_, i) => `trending-skeleton-${i}`,
                ).map((id) => (
                  <div
                    key={id}
                    className="h-9 w-28 animate-pulse rounded-full bg-secondary"
                  />
                ))}
              </div>
            ) : trending.length === 0 ? (
              <div
                data-ocid="discover.trending.empty_state"
                className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center"
              >
                <p className="font-display text-sm font-semibold text-foreground">
                  No trending tags yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Be the first to post with a hashtag.
                </p>
              </div>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {trending.map((tag, index) => (
                  <li key={tag.tag}>
                    <Link
                      to="/hashtag/$tag"
                      params={{ tag: normalizeHashtag(tag.tag) }}
                      data-ocid={`discover.trending.${index + 1}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-2 text-sm font-semibold text-accent transition-smooth hover:bg-accent/20"
                    >
                      <Hash className="size-3.5" aria-hidden="true" />
                      {normalizeHashtag(tag.tag)}
                      <Badge
                        variant="secondary"
                        className="ml-0.5 rounded-full bg-accent/15 px-1.5 text-[10px] text-accent"
                      >
                        {formatCount(tag.reelCount)}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}

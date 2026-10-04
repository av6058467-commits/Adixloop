import type { ReelView, SearchResults, UserSummary } from "@/backend";
import { SearchFilter } from "@/backend";
import { DiscoverPage } from "@/pages/DiscoverPage";
import { resetCoreMock, setSignedIn } from "@/test/coreMock";
import { createMockActor, renderWithProviders } from "@/test/harness";
import { testIdentity, testPrincipal } from "@/test/identity";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreMockState: state } = await import("@/test/coreMock");
  return {
    useActor: () => ({ actor: state.actor, isFetching: state.isFetching }),
    useInternetIdentity: () => ({
      identity: state.identity,
      isAuthenticated: state.isAuthenticated,
      isInitializing: state.isInitializing,
      isLoggingIn: state.isLoggingIn,
      login: state.login,
      clear: state.clear,
    }),
  };
});

const MATCH = testPrincipal("match");

function reel(overrides: Partial<ReelView> = {}): ReelView {
  return {
    id: 7n,
    creator: MATCH,
    isLiked: false,
    likeCount: 3n,
    creatorAvatarUrl: undefined,
    thumbnailUrl: undefined,
    hashtags: ["dance"],
    creatorDisplayName: "Match User",
    createdAt: 1_700_000_000_000_000_000n,
    audience: "everyone" as ReelView["audience"],
    creatorUsername: "match",
    mediaUrl: "https://example.test/reel.mp4",
    allowComments: true,
    caption: "dance loop",
    commentCount: 0n,
    allowDuet: true,
    soundLabel: "Original sound",
    location: undefined,
    ...overrides,
  };
}

const SUMMARY: UserSummary = {
  id: MATCH,
  username: "match",
  displayName: "Match User",
  avatarUrl: undefined,
  isFollowing: false,
  followerCount: 12n,
  followingCount: 3n,
};

const RESULTS: SearchResults = {
  users: [MATCH],
  reels: [7n],
  sounds: [{ soundLabel: "dance beat", reelCount: 5n }],
  hashtags: [{ tag: "dance", reelCount: 9n }],
};

beforeEach(() => {
  resetCoreMock();
});

describe("DiscoverPage", () => {
  it("shows trending hashtags before a query is typed", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      trendingHashtags: async () => [{ tag: "dance", reelCount: 9n }],
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: DiscoverPage });
    render();

    expect(await screen.findByText("Trending hashtags")).toBeInTheDocument();
    expect(await screen.findByText("dance")).toBeInTheDocument();
  });

  it("returns matching users, reels, sounds, and hashtags for a typed query", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      trendingHashtags: async () => [],
      search: async () => RESULTS,
      getUserSummary: async () => SUMMARY,
      getReel: async () => reel(),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: DiscoverPage });
    render();

    await userEvent.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "dance",
    );

    await waitFor(() => {
      expect(actor.search).toHaveBeenCalledWith(SearchFilter.all, "dance");
    });

    // Each result kind renders its own row: user, reel grid, sound, hashtag.
    expect(await screen.findByTestId("discover.user.1")).toBeInTheDocument();
    expect(screen.getByTestId("discover.reel_grid")).toBeInTheDocument();
    expect(screen.getByTestId("discover.sound.1")).toBeInTheDocument();
    expect(screen.getByTestId("discover.hashtag.1")).toBeInTheDocument();
    expect(screen.getByText("dance beat")).toBeInTheDocument();
    expect(screen.getByText("#dance")).toBeInTheDocument();
  });

  it("narrows results to the selected filter tab", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      trendingHashtags: async () => [],
      search: async () => RESULTS,
      getUserSummary: async () => SUMMARY,
      getReel: async () => reel(),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: DiscoverPage });
    render();

    await userEvent.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "dance",
    );
    await screen.findByText("People");

    await userEvent.click(screen.getByRole("tab", { name: "Users" }));

    await waitFor(() => {
      expect(actor.search).toHaveBeenCalledWith(SearchFilter.users, "dance");
    });
    expect(await screen.findByTestId("discover.user.1")).toBeInTheDocument();
    expect(screen.queryByTestId("discover.sound.1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("discover.hashtag.1")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      trendingHashtags: async () => [],
      search: async () => ({
        users: [],
        reels: [],
        sounds: [],
        hashtags: [],
      }),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: DiscoverPage });
    render();

    await userEvent.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "zzz",
    );

    expect(await screen.findByText("No results for “zzz”")).toBeInTheDocument();
  });
});

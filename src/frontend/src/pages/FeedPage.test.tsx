import type { ReelView } from "@/backend";
import { FeedPage } from "@/pages/FeedPage";
import {
  coreMockState,
  resetCoreMock,
  setSignedIn,
  setSignedOut,
} from "@/test/coreMock";
import { createMockActor } from "@/test/harness";
import { renderWithProviders } from "@/test/harness";
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

const CREATOR = testPrincipal("creator");

function reel(overrides: Partial<ReelView> = {}): ReelView {
  return {
    id: 1n,
    creator: CREATOR,
    isLiked: false,
    likeCount: 4n,
    creatorAvatarUrl: undefined,
    thumbnailUrl: undefined,
    hashtags: ["dance"],
    creatorDisplayName: "Creator",
    createdAt: 1_700_000_000_000_000_000n,
    audience: "everyone" as ReelView["audience"],
    creatorUsername: "creator",
    mediaUrl: "https://example.test/reel.mp4",
    allowComments: true,
    caption: "hello loop",
    commentCount: 2n,
    allowDuet: true,
    soundLabel: "Original sound",
    location: undefined,
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreMock();
});

describe("FeedPage", () => {
  it("lets a signed-out visitor browse the For You feed", async () => {
    setSignedOut();
    const actor = createMockActor({
      listForYouFeed: async () => [reel()],
      listFollowingFeed: async () => [],
    });
    coreMockState.actor = actor;

    const { render } = renderWithProviders({ component: FeedPage });
    render();

    expect(await screen.findByText("hello loop")).toBeInTheDocument();
    expect(screen.getByText("@creator")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to like, comment & share"),
    ).toBeInTheDocument();
  });

  it("prompts a signed-out visitor to sign in when they like a reel", async () => {
    setSignedOut();
    const actor = createMockActor({
      listForYouFeed: async () => [reel()],
      listFollowingFeed: async () => [],
    });
    coreMockState.actor = actor;

    const { render, router } = renderWithProviders({ component: FeedPage });
    render();

    const likeButton = await screen.findByRole("button", { name: "Like reel" });
    await userEvent.click(likeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
    expect(actor.toggleReelLike).not.toHaveBeenCalled();
  });

  it("toggles the like optimistically for a signed-in user", async () => {
    // A stateful backend stand-in: the toggle flips the stored reel so the
    // post-mutation refetch agrees with the optimistic update.
    let liked = false;
    let likeCount = 4n;
    const actor = createMockActor({
      listForYouFeed: async () => [reel({ likeCount, isLiked: liked })],
      listFollowingFeed: async () => [],
      toggleReelLike: async () => {
        liked = !liked;
        likeCount = liked ? likeCount + 1n : likeCount - 1n;
        return { __kind__: "ok", ok: liked };
      },
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({ component: FeedPage });
    render();

    const likeButton = await screen.findByRole("button", { name: "Like reel" });
    expect(likeButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(likeButton);

    await waitFor(() => {
      expect(actor.toggleReelLike).toHaveBeenCalledWith(1n);
    });
    // The optimistic update flips the heart and increments the count.
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Unlike reel" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("opens a deep-linked reel through the caller-scoped query when signed in", async () => {
    const actor = createMockActor({
      listForYouFeed: async () => [],
      listFollowingFeed: async () => [],
      getReelForCaller: async () => reel({ id: 5n, caption: "deep linked" }),
      getReel: async () => reel({ id: 5n, caption: "public deep link" }),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({
      component: FeedPage,
      initialPath: "/?reel=5",
    });
    render();

    expect(await screen.findByText("deep linked")).toBeInTheDocument();
    // Signed in, the viewer-scoped query is used so isLiked reflects the caller.
    expect(actor.getReelForCaller).toHaveBeenCalledWith(5n);
    expect(actor.getReel).not.toHaveBeenCalled();
  });

  it("opens a deep-linked reel through the public query when signed out", async () => {
    setSignedOut();
    const actor = createMockActor({
      listForYouFeed: async () => [],
      listFollowingFeed: async () => [],
      getReelForCaller: async () =>
        reel({ id: 5n, caption: "caller deep link" }),
      getReel: async () => reel({ id: 5n, caption: "public deep link" }),
    });
    coreMockState.actor = actor;

    const { render } = renderWithProviders({
      component: FeedPage,
      initialPath: "/?reel=5",
    });
    render();

    expect(await screen.findByText("public deep link")).toBeInTheDocument();
    expect(actor.getReel).toHaveBeenCalledWith(5n);
    expect(actor.getReelForCaller).not.toHaveBeenCalled();
  });

  it("switches to the Following tab and shows its empty state", async () => {
    setSignedOut();
    const actor = createMockActor({
      listForYouFeed: async () => [reel()],
      listFollowingFeed: async () => [],
    });
    coreMockState.actor = actor;

    const { render } = renderWithProviders({ component: FeedPage });
    render();

    await screen.findByText("hello loop");
    await userEvent.click(screen.getByRole("button", { name: "Following" }));

    expect(
      await screen.findByText("Nothing from your circle yet"),
    ).toBeInTheDocument();
  });
});

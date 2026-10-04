import type { ReelView, UserProfile, UserSummary } from "@/backend";
import { ProfilePage } from "@/pages/ProfilePage";
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

const TARGET = testPrincipal("target");
const TARGET_ID = TARGET.toText();

const PROFILE: UserProfile = {
  id: TARGET,
  username: "target",
  displayName: "Target User",
  bio: "reels and loops",
  avatarUrl: undefined,
  createdAt: 1_700_000_000_000_000_000n,
};

function summary(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: TARGET,
    username: "target",
    displayName: "Target User",
    avatarUrl: undefined,
    isFollowing: false,
    followerCount: 12n,
    followingCount: 3n,
    ...overrides,
  };
}

function reel(): ReelView {
  return {
    id: 5n,
    creator: TARGET,
    isLiked: false,
    likeCount: 2n,
    creatorAvatarUrl: undefined,
    thumbnailUrl: undefined,
    hashtags: [],
    creatorDisplayName: "Target User",
    createdAt: 1_700_000_000_000_000_000n,
    audience: "everyone" as ReelView["audience"],
    creatorUsername: "target",
    mediaUrl: "https://example.test/reel.mp4",
    allowComments: true,
    caption: "target reel",
    commentCount: 0n,
    allowDuet: true,
    soundLabel: undefined,
    location: undefined,
  };
}

beforeEach(() => {
  resetCoreMock();
});

describe("ProfilePage", () => {
  it("renders the profile header with stats and the reels grid", async () => {
    const actor = createMockActor({
      getProfile: async () => PROFILE,
      getUserSummary: async () => summary(),
      listReelsByUser: async () => [reel()],
      getReel: async () => reel(),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({
      component: ProfilePage,
      path: "/profile/$userId",
      initialPath: `/profile/${TARGET_ID}`,
    });
    render();

    expect(await screen.findByText("Target User")).toBeInTheDocument();
    expect(screen.getByText("@target")).toBeInTheDocument();
    expect(screen.getByText("reels and loops")).toBeInTheDocument();
    expect(screen.getByTestId("profile.posts_count")).toHaveTextContent("1");
    expect(await screen.findByTestId("profile.reel_grid")).toBeInTheDocument();
  });

  it("follows and unfollows the viewed user", async () => {
    let following = false;
    const actor = createMockActor({
      getProfile: async () => PROFILE,
      getUserSummary: async () =>
        summary({
          isFollowing: following,
          followerCount: following ? 13n : 12n,
        }),
      listReelsByUser: async () => [],
      follow: async () => {
        following = true;
        return {
          __kind__: "ok",
          ok: { isFollowing: true, followerCount: 13n, followingCount: 1n },
        };
      },
      unfollow: async () => {
        following = false;
        return {
          __kind__: "ok",
          ok: { isFollowing: false, followerCount: 12n, followingCount: 0n },
        };
      },
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({
      component: ProfilePage,
      path: "/profile/$userId",
      initialPath: `/profile/${TARGET_ID}`,
    });
    render();

    const followButton = await screen.findByRole("button", { name: "Follow" });
    await userEvent.click(followButton);

    await waitFor(() => {
      expect(actor.follow).toHaveBeenCalledWith(TARGET);
    });
    expect(
      await screen.findByRole("button", { name: "Following" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Following" }));
    await waitFor(() => {
      expect(actor.unfollow).toHaveBeenCalledWith(TARGET);
    });
    expect(
      await screen.findByRole("button", { name: "Follow" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state for a profile that does not exist", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      getUserSummary: async () => null,
      listReelsByUser: async () => [],
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderWithProviders({
      component: ProfilePage,
      path: "/profile/$userId",
      initialPath: `/profile/${TARGET_ID}`,
    });
    render();

    expect(await screen.findByText("Profile not found")).toBeInTheDocument();
  });
});

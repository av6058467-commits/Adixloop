import type { CommentView } from "@/backend";
import { CommentsSheet } from "@/components/CommentsSheet";
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

const AUTHOR = testPrincipal("author");

function comment(overrides: Partial<CommentView> = {}): CommentView {
  return {
    id: 1n,
    isLiked: false,
    authorUsername: "author",
    likeCount: 2n,
    createdAt: 1_700_000_000_000_000_000n,
    text: "first!",
    author: AUTHOR,
    authorAvatarUrl: undefined,
    authorDisplayName: "Author",
    reelId: 7n,
    ...overrides,
  };
}

/** Mount the sheet open on reel 7 with a no-op auth prompt. */
function renderSheet() {
  return renderWithProviders({
    component: () => (
      <CommentsSheet
        reelId={7n}
        open
        onOpenChange={() => {}}
        onRequireAuth={() => {}}
      />
    ),
  });
}

beforeEach(() => {
  resetCoreMock();
});

describe("CommentsSheet", () => {
  it("lists a reel's comments", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      listComments: async () => [comment()],
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderSheet();
    render();

    expect(await screen.findByText("first!")).toBeInTheDocument();
    expect(screen.getByText("@author")).toBeInTheDocument();
  });

  it("adds a comment and shows it immediately", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      listComments: async () => [],
      addComment: async (_reelId: bigint, text: string) => ({
        __kind__: "ok",
        ok: comment({ id: 2n, text, authorUsername: "viewer" }),
      }),
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderSheet();
    render();

    await screen.findByText("No comments yet");
    await userEvent.type(
      screen.getByRole("textbox", { name: "Add a comment" }),
      "nice loop",
    );
    await userEvent.click(screen.getByRole("button", { name: "Post comment" }));

    await waitFor(() => {
      expect(actor.addComment).toHaveBeenCalledWith(7n, "nice loop");
    });
    expect(await screen.findByText("nice loop")).toBeInTheDocument();
  });

  it("toggles a like on an individual comment", async () => {
    let liked = false;
    const actor = createMockActor({
      getProfile: async () => null,
      listComments: async () => [comment({ isLiked: liked })],
      toggleCommentLike: async () => {
        liked = !liked;
        return { __kind__: "ok", ok: liked };
      },
    });
    setSignedIn(actor, testIdentity("viewer"));

    const { render } = renderSheet();
    render();

    const likeButton = await screen.findByRole("button", {
      name: "Like comment",
    });
    expect(likeButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(likeButton);

    await waitFor(() => {
      expect(actor.toggleCommentLike).toHaveBeenCalledWith(1n);
    });
    expect(
      await screen.findByRole("button", { name: "Unlike comment" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

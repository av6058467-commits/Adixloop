import type { Draft, ReelView } from "@/backend";
import { Audience } from "@/backend";
import { CreatePage } from "@/pages/CreatePage";
import { resetCoreMock, setSignedIn } from "@/test/coreMock";
import { createMockActor, renderWithProviders } from "@/test/harness";
import { testIdentity, testPrincipal } from "@/test/identity";
import { screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
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
    loadConfig: async () => ({
      backend_host: "http://localhost:4943",
      bucket_name: "test-bucket",
      storage_gateway_url: "http://localhost:8080",
      backend_canister_id: "aaaaa-aa",
      project_id: "test-project",
    }),
  };
});

// The upload step builds a real HttpAgent and, for localhost hosts, calls
// fetchRootKey() — a live network round trip. Stand in for the agent so the
// create flow can be driven end to end without any network.
vi.mock("@icp-sdk/core/agent", () => {
  class HttpAgent {
    async fetchRootKey() {
      return new Uint8Array();
    }
  }
  return { HttpAgent };
});

// The upload step talks to the object-storage gateway. Stand in for it so the
// create flow can be driven end to end without a network.
vi.mock("@caffeineai/object-storage", () => {
  class ExternalBlob {
    static fromBytes() {
      return new ExternalBlob();
    }
    withUploadProgress() {
      return this;
    }
    async getBytes() {
      return new Uint8Array([1, 2, 3]);
    }
  }
  class StorageClient {
    async putFile() {
      return { hash: "test-hash" };
    }
    async getDirectURL() {
      return "https://example.test/uploaded.mp4";
    }
  }
  return { ExternalBlob, StorageClient };
});

const CREATOR = testPrincipal("creator");

function reel(): ReelView {
  return {
    id: 1n,
    creator: CREATOR,
    isLiked: false,
    likeCount: 0n,
    creatorAvatarUrl: undefined,
    thumbnailUrl: undefined,
    hashtags: [],
    creatorDisplayName: "Creator",
    createdAt: 1_700_000_000_000_000_000n,
    audience: "everyone" as ReelView["audience"],
    creatorUsername: "creator",
    mediaUrl: "https://example.test/uploaded.mp4",
    allowComments: true,
    caption: "my new reel",
    commentCount: 0n,
    allowDuet: true,
    soundLabel: undefined,
    location: undefined,
  };
}

beforeEach(() => {
  resetCoreMock();
});

describe("CreatePage", () => {
  it("uploads media, edits, and posts a reel to the feed", async () => {
    const actor = createMockActor({
      getProfile: async () => null,
      listDrafts: async () => [],
      createReel: async () => ({ __kind__: "ok", ok: reel() }),
    });
    setSignedIn(actor, testIdentity("creator"));

    const { render, router } = renderWithProviders({ component: CreatePage });
    render();

    // Step 1 — choose video and upload a file.
    await userEvent.click(await screen.findByTestId("create.media_kind.video"));
    const fileInput = screen.getByTestId("create.file_input");
    const file = new File(["video-bytes"], "clip.mp4", { type: "video/mp4" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await screen.findByTestId("create.upload_preview"),
    ).toBeInTheDocument();

    // Step 2 — caption.
    await userEvent.click(screen.getByRole("button", { name: /Next/ }));
    const caption = await screen.findByLabelText(/caption/i);
    await userEvent.type(caption, "my new reel");

    // Step 3 — post.
    await userEvent.click(screen.getByRole("button", { name: /Next/ }));
    await userEvent.click(
      await screen.findByRole("button", { name: /Post reel/ }),
    );

    await waitFor(() => {
      expect(actor.createReel).toHaveBeenCalledTimes(1);
    });
    const input = actor.createReel.mock.calls[0][0] as {
      mediaUrl: string;
      caption: string;
      audience: Audience;
    };
    expect(input.mediaUrl).toBe("https://example.test/uploaded.mp4");
    expect(input.caption).toBe("my new reel");
    expect(input.audience).toBe(Audience.everyone);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
  });

  it("saves a draft from the options step", async () => {
    let drafts: Draft[] = [];
    const actor = createMockActor({
      getProfile: async () => null,
      listDrafts: async () => drafts,
      saveDraft: async () => {
        const draft: Draft = {
          id: 1n,
          owner: CREATOR,
          mediaUrl: "https://example.test/uploaded.mp4",
          thumbnailUrl: undefined,
          caption: "draft caption",
          hashtags: [],
          soundLabel: undefined,
          location: undefined,
          audience: Audience.everyone,
          allowComments: true,
          allowDuet: true,
          createdAt: 1_700_000_000_000_000_000n,
          updatedAt: 1_700_000_000_000_000_000n,
        };
        drafts = [draft];
        return { __kind__: "ok", ok: draft };
      },
    });
    setSignedIn(actor, testIdentity("creator"));

    const { render } = renderWithProviders({ component: CreatePage });
    render();

    await userEvent.click(await screen.findByTestId("create.media_kind.video"));
    fireEvent.change(screen.getByTestId("create.file_input"), {
      target: {
        files: [new File(["video-bytes"], "clip.mp4", { type: "video/mp4" })],
      },
    });
    await screen.findByTestId("create.upload_preview");

    await userEvent.click(screen.getByRole("button", { name: /Next/ }));
    await userEvent.type(
      await screen.findByLabelText(/caption/i),
      "draft caption",
    );
    await userEvent.click(screen.getByRole("button", { name: /Next/ }));

    await userEvent.click(
      await screen.findByRole("button", { name: /Save to drafts/i }),
    );

    await waitFor(() => {
      expect(actor.saveDraft).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByTestId("create.draft_saved_state"),
    ).toBeInTheDocument();
  });
});

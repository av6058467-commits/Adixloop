import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

/**
 * Create a profile for the given caller and return its principal text.
 *
 * The lane speaks the generated declarations' Candid shapes, not the
 * TypeScript wrapper's: `?T` is `[] | [T]`, so the optional avatar is `[]`.
 */
async function seedProfile(
  identity: ReturnType<typeof createIdentity>,
  username: string,
  displayName: string,
): Promise<string> {
  actor.setIdentity(identity);
  const result = await actor.createProfile(username, displayName, "bio", []);
  expect(result).toHaveProperty("ok");
  return identity.getPrincipal().toText();
}

it("answers empty-state reads instead of trapping", async () => {
  actor.setIdentity(alice);
  await expect(actor.listForYouFeed()).resolves.toEqual([]);
  await expect(actor.listFollowingFeed()).resolves.toEqual([]);
  await expect(actor.listDrafts()).resolves.toEqual([]);
  await expect(actor.listTransactions()).resolves.toEqual([]);
  await expect(actor.listActivity([])).resolves.toEqual([]);
  await expect(actor.trendingHashtags(10n)).resolves.toEqual([]);
  await expect(actor.getProfile(alice.getPrincipal())).resolves.toEqual([]);
});

it("round-trips a profile through the real canister", async () => {
  const aliceId = await seedProfile(alice, "alice", "Alice");
  const profile = await actor.getProfile(alice.getPrincipal());
  expect(profile).toHaveLength(1);
  expect(profile[0]).toMatchObject({
    username: "alice",
    displayName: "Alice",
    id: alice.getPrincipal(),
  });
  expect(aliceId).toBe(alice.getPrincipal().toText());
});

it("creates a reel and surfaces it in the For You feed and creator grid", async () => {
  actor.setIdentity(alice);
  const created = await actor.createReel({
    mediaUrl: "https://example.test/reel.mp4",
    thumbnailUrl: [],
    caption: "first loop",
    hashtags: ["dance"],
    soundLabel: ["Original sound"],
    location: [],
    audience: { everyone: null },
    allowComments: true,
    allowDuet: true,
  });
  expect(created).toHaveProperty("ok");
  if (!("ok" in created)) return;
  const reelId = created.ok.id;

  const feed = await actor.listForYouFeed();
  expect(feed.map((reel) => reel.id)).toContain(reelId);

  const byUser = await actor.listReelsByUser(alice.getPrincipal());
  expect(byUser.map((reel) => reel.id)).toContain(reelId);
});

it("toggles a reel like and reflects it in the like state", async () => {
  actor.setIdentity(alice);
  const created = await actor.createReel({
    mediaUrl: "https://example.test/like.mp4",
    thumbnailUrl: [],
    caption: "like me",
    hashtags: [],
    soundLabel: [],
    location: [],
    audience: { everyone: null },
    allowComments: true,
    allowDuet: true,
  });
  if (!("ok" in created)) throw new Error("reel creation failed");
  const reelId = created.ok.id;

  actor.setIdentity(bob);
  const liked = await actor.toggleReelLike(reelId);
  expect(liked).toEqual({ ok: true });

  const state = await actor.getReelLikeState(reelId);
  expect(state.isLiked).toBe(true);
  expect(state.likeCount).toBe(1n);

  const unliked = await actor.toggleReelLike(reelId);
  expect(unliked).toEqual({ ok: false });
  expect((await actor.getReelLikeState(reelId)).likeCount).toBe(0n);
});

it("adds a comment and lists it back", async () => {
  actor.setIdentity(alice);
  const created = await actor.createReel({
    mediaUrl: "https://example.test/comment.mp4",
    thumbnailUrl: [],
    caption: "comment me",
    hashtags: [],
    soundLabel: [],
    location: [],
    audience: { everyone: null },
    allowComments: true,
    allowDuet: true,
  });
  if (!("ok" in created)) throw new Error("reel creation failed");
  const reelId = created.ok.id;

  actor.setIdentity(bob);
  const added = await actor.addComment(reelId, "nice one");
  expect(added).toHaveProperty("ok");

  const comments = await actor.listComments(reelId);
  expect(comments).toHaveLength(1);
  expect(comments[0]).toMatchObject({ text: "nice one", reelId });
});

it("follows another user and reports the follow state", async () => {
  actor.setIdentity(alice);
  const followed = await actor.follow(bob.getPrincipal());
  expect(followed).toHaveProperty("ok");
  if (!("ok" in followed)) return;
  expect(followed.ok.isFollowing).toBe(true);
  expect(followed.ok.followerCount).toBe(1n);

  const state = await actor.getFollowState(bob.getPrincipal());
  expect(state.isFollowing).toBe(true);

  const unfollowed = await actor.unfollow(bob.getPrincipal());
  expect(unfollowed).toHaveProperty("ok");
  if (!("ok" in unfollowed)) return;
  expect(unfollowed.ok.isFollowing).toBe(false);
});

it("rejects a withdrawal that exceeds the balance", async () => {
  actor.setIdentity(alice);
  const wallet = await actor.getWallet();
  expect(wallet.balance).toBe(0n);

  const result = await actor.requestWithdrawal({
    upiId: "alice@bank",
    amount: 500n,
  });
  expect(result).toEqual({ err: { insufficientBalance: null } });
});

it("searches users and hashtags for a typed query", async () => {
  actor.setIdentity(alice);
  const users = await actor.search({ users: null }, "alice");
  expect(users.users.map((p) => p.toText())).toContain(
    alice.getPrincipal().toText(),
  );

  const hashtags = await actor.search({ hashtags: null }, "dance");
  expect(hashtags.hashtags.map((h) => h.tag)).toContain("dance");
});

it("keeps one caller's drafts private from another", async () => {
  actor.setIdentity(alice);
  const saved = await actor.saveDraft([], {
    mediaUrl: ["https://example.test/draft.mp4"],
    thumbnailUrl: [],
    caption: "alice draft",
    hashtags: [],
    soundLabel: [],
    location: [],
    audience: { everyone: null },
    allowComments: true,
    allowDuet: true,
  });
  expect(saved).toHaveProperty("ok");

  actor.setIdentity(bob);
  const bobDrafts = await actor.listDrafts();
  expect(bobDrafts).toEqual([]);
});

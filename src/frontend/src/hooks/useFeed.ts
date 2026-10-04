import type { CommentView, ReelView } from "@/backend";
import { createActor } from "@/lib/backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Which feed tab is active. */
export type FeedTab = "foryou" | "following";

/** Fetch the "For You" reels feed. */
export function useForYouFeed() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["feed", "foryou"],
    queryFn: async (): Promise<ReelView[]> => {
      if (!actor) return [];
      return actor.listForYouFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the "Following" reels feed. */
export function useFollowingFeed() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["feed", "following"],
    queryFn: async (): Promise<ReelView[]> => {
      if (!actor) return [];
      return actor.listFollowingFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single reel view by id. */
export function useReel(reelId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["reel", reelId?.toString() ?? "none", isAuthenticated],
    queryFn: async (): Promise<ReelView | null> => {
      if (!actor || reelId === null) return null;
      // Use the viewer-scoped query when signed in so isLiked reflects the
      // caller; fall back to the public query when signed out.
      return isAuthenticated
        ? actor.getReelForCaller(reelId)
        : actor.getReel(reelId);
    },
    enabled: !!actor && !isFetching && reelId !== null,
  });
}

/**
 * Toggle a reel like. Optimistically flips the cached feed rows so the heart
 * and count update instantly, then reconciles with the backend result.
 */
export function useToggleReelLike() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reelId: bigint): Promise<boolean> => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.toggleReelLike(reelId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onMutate: async (reelId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const snapshot = queryClient.getQueriesData<ReelView[]>({
        queryKey: ["feed"],
      });
      for (const [key, data] of snapshot) {
        if (!data) continue;
        queryClient.setQueryData<ReelView[]>(
          key,
          data.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  isLiked: !reel.isLiked,
                  likeCount: reel.isLiked
                    ? reel.likeCount - 1n
                    : reel.likeCount + 1n,
                }
              : reel,
          ),
        );
      }
      return { snapshot };
    },
    onError: (_error, _reelId, context) => {
      if (!context) return;
      for (const [key, data] of context.snapshot) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/** Fetch the comments for a reel. */
export function useComments(reelId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["comments", reelId?.toString() ?? "none"],
    queryFn: async (): Promise<CommentView[]> => {
      if (!actor || reelId === null) return [];
      return actor.listComments(reelId);
    },
    enabled: !!actor && !isFetching && reelId !== null,
  });
}

/** Add a comment to a reel. */
export function useAddComment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { reelId: bigint; text: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.addComment(input.reelId, input.text);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (comment) => {
      queryClient.setQueryData<CommentView[]>(
        ["comments", comment.reelId.toString()],
        (current) => [comment, ...(current ?? [])],
      );
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/** Toggle a like on a comment. */
export function useToggleCommentLike() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: bigint): Promise<boolean> => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.toggleCommentLike(commentId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const snapshot = queryClient.getQueriesData<CommentView[]>({
        queryKey: ["comments"],
      });
      for (const [key, data] of snapshot) {
        if (!data) continue;
        queryClient.setQueryData<CommentView[]>(
          key,
          data.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likeCount: comment.isLiked
                    ? comment.likeCount - 1n
                    : comment.likeCount + 1n,
                }
              : comment,
          ),
        );
      }
      return { snapshot };
    },
    onError: (_error, _commentId, context) => {
      if (!context) return;
      for (const [key, data] of context.snapshot) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

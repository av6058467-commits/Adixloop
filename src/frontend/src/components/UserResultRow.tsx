import type { UserSummary } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { createActor } from "@/lib/backend";
import { formatCount, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

interface UserResultRowProps {
  /** The user to display. */
  userId: Principal;
  /** data-ocid for the row. */
  ocid?: string;
}

/**
 * A single user search result: circular avatar, username, follower count, and
 * a pill Follow / Following button. Follow state comes from `getUserSummary`;
 * toggling calls `follow` / `unfollow` and refreshes the summary.
 */
export function UserResultRow({
  userId,
  ocid = "user_result",
}: UserResultRowProps) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const { principal } = useApp();

  const summaryQuery = useQuery({
    queryKey: ["user-summary", userId.toText()],
    queryFn: async (): Promise<UserSummary | null> => {
      if (!actor) return null;
      return actor.getUserSummary(userId);
    },
    enabled: !!actor && !isFetching,
  });

  const summary = summaryQuery.data ?? null;
  const isSelf = principal === userId.toText();

  const toggleFollow = useMutation({
    mutationFn: async (nextFollowing: boolean) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = nextFollowing
        ? await actor.follow(userId)
        : await actor.unfollow(userId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["user-summary", userId.toText()],
      });
    },
  });

  const displayName = summary?.displayName ?? "Unknown";
  const username = summary?.username ?? userId.toText().slice(0, 8);
  const isFollowing = summary?.isFollowing ?? false;

  return (
    <div
      data-ocid={ocid}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
    >
      <Link
        to="/profile/$userId"
        params={{ userId: userId.toText() }}
        data-ocid={`${ocid}.link`}
        className="shrink-0"
        aria-label={`View ${displayName}'s profile`}
      >
        <Avatar className="size-12 ring-2 ring-border">
          {summary?.avatarUrl ? (
            <AvatarImage src={summary.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
            {initials(displayName || username)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to="/profile/$userId"
          params={{ userId: userId.toText() }}
          className="block truncate font-display text-sm font-semibold text-foreground hover:text-primary"
        >
          {username}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {displayName} · {formatCount(summary?.followerCount ?? 0n)} followers
        </p>
      </div>

      {isSelf ? null : (
        <Button
          type="button"
          size="sm"
          variant={isFollowing ? "secondary" : "default"}
          disabled={toggleFollow.isPending || !summary}
          data-ocid={`${ocid}.follow_button`}
          aria-pressed={isFollowing}
          onClick={() => toggleFollow.mutate(!isFollowing)}
          className={cn(
            "shrink-0 rounded-full px-4 font-semibold",
            !isFollowing && "bg-primary text-primary-foreground",
          )}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}

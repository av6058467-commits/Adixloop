import type { ReelView } from "@/backend";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import {
  FollowListDialog,
  type FollowListKind,
} from "@/components/FollowListDialog";
import { Layout } from "@/components/Layout";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ReelGrid } from "@/components/ReelGrid";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useUserProfile, useUserSummary } from "@/hooks/useProfile";
import { createActor } from "@/lib/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { UserX } from "lucide-react";
import { useMemo, useState } from "react";

/** User profile: identity header, follow controls, and a grid of reels. */
export function ProfilePage() {
  const { userId } = useParams({ from: "/profile/$userId" });
  const { principal } = useApp();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [followList, setFollowList] = useState<FollowListKind | null>(null);

  const target = useMemo<Principal | null>(() => {
    try {
      return Principal.fromText(userId);
    } catch {
      return null;
    }
  }, [userId]);

  const profileQuery = useUserProfile(target);
  const summaryQuery = useUserSummary(target);

  const reelsQuery = useQuery({
    queryKey: ["reels-by-user", userId],
    queryFn: async (): Promise<ReelView[]> => {
      if (!actor || !target) return [];
      return actor.listReelsByUser(target);
    },
    enabled: !!actor && !isFetching && !!target,
  });

  const toggleFollow = useMutation({
    mutationFn: async (nextFollowing: boolean) => {
      if (!actor || !target) throw new Error("Backend is not ready");
      const result = nextFollowing
        ? await actor.follow(target)
        : await actor.unfollow(target);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["user-summary", userId],
      });
    },
  });

  const profile = profileQuery.data ?? null;
  const summary = summaryQuery.data ?? null;
  const reels = reelsQuery.data ?? [];
  const isSelf = principal != null && principal === userId;

  if (profileQuery.isLoading) {
    return (
      <RequireAuth>
        <Layout title="Profile" back>
          <div
            data-ocid="profile.loading_state"
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="size-20 shrink-0 animate-pulse rounded-full bg-secondary" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-5 w-32 animate-pulse rounded-full bg-secondary" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-secondary" />
              </div>
            </div>
            <div className="h-20 animate-pulse rounded-2xl bg-secondary" />
            <div className="h-10 animate-pulse rounded-full bg-secondary" />
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  if (!profile) {
    return (
      <RequireAuth>
        <Layout title="Profile" back>
          <div
            data-ocid="profile.empty_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <UserX className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-base font-semibold text-foreground">
              Profile not found
            </p>
            <p className="max-w-[18rem] text-sm text-muted-foreground">
              This account doesn't exist or may have been removed.
            </p>
            <Button asChild variant="secondary" className="mt-1 rounded-full">
              <a href="/" data-ocid="profile.back_home_button">
                Back to feed
              </a>
            </Button>
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Layout title="Profile" back>
        <div data-ocid="profile.page" className="flex flex-col gap-5">
          <ProfileHeader
            profile={profile}
            summary={summary}
            postCount={reels.length}
            isSelf={isSelf}
            isFollowPending={toggleFollow.isPending}
            onToggleFollow={() =>
              toggleFollow.mutate(!(summary?.isFollowing ?? false))
            }
            onEdit={() => setEditOpen(true)}
            onOpenFollowers={() => setFollowList("followers")}
            onOpenFollowing={() => setFollowList("following")}
          />

          <section className="flex flex-col gap-2">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Reels
            </h2>
            <ReelGrid
              reelIds={reels.map((reel) => reel.id)}
              ocid="profile.reel_grid"
              emptyMessage={
                isSelf
                  ? "Share your first reel to fill this grid."
                  : "This user hasn't posted any reels yet."
              }
            />
          </section>
        </div>

        {isSelf ? (
          <EditProfileDialog
            profile={profile}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        ) : null}

        {target ? (
          <FollowListDialog
            userId={target}
            kind={followList ?? "followers"}
            open={followList !== null}
            onOpenChange={(open) => {
              if (!open) setFollowList(null);
            }}
          />
        ) : null}
      </Layout>
    </RequireAuth>
  );
}

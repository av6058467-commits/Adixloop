import { UserResultRow } from "@/components/UserResultRow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createActor } from "@/lib/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

export type FollowListKind = "followers" | "following";

interface FollowListDialogProps {
  /** The user whose followers/following are shown. */
  userId: Principal;
  /** Which list to display. */
  kind: FollowListKind;
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog requests to open or close. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal list of a user's followers or following. Each row links to that
 * user's profile and offers a Follow / Following toggle.
 */
export function FollowListDialog({
  userId,
  kind,
  open,
  onOpenChange,
}: FollowListDialogProps) {
  const { actor, isFetching } = useActor(createActor);

  const listQuery = useQuery({
    queryKey: ["follow-list", kind, userId.toText()],
    queryFn: async (): Promise<Principal[]> => {
      if (!actor) return [];
      return kind === "followers"
        ? actor.listFollowers(userId)
        : actor.listFollowing(userId);
    },
    enabled: !!actor && !isFetching && open,
  });

  const users = listQuery.data ?? [];
  const title = kind === "followers" ? "Followers" : "Following";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid={`profile.${kind}_dialog`}
        className="max-h-[80dvh] overflow-hidden rounded-2xl border-border bg-card"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            {title}
          </DialogTitle>
          <DialogDescription>
            {kind === "followers"
              ? "People who follow this account."
              : "Accounts this user follows."}
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar -mx-1 max-h-[60dvh] overflow-y-auto px-1">
          {listQuery.isLoading ? (
            <div
              data-ocid={`profile.${kind}.loading_state`}
              className="flex flex-col gap-2"
            >
              {Array.from({ length: 5 }, (_, i) => `${kind}-skeleton-${i}`).map(
                (id) => (
                  <div
                    key={id}
                    className="h-16 animate-pulse rounded-2xl bg-secondary"
                  />
                ),
              )}
            </div>
          ) : users.length === 0 ? (
            <div
              data-ocid={`profile.${kind}.empty_state`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Users className="size-5" aria-hidden="true" />
              </span>
              <p className="font-display text-sm font-semibold text-foreground">
                {kind === "followers"
                  ? "No followers yet"
                  : "Not following anyone"}
              </p>
              <p className="max-w-[16rem] text-xs text-muted-foreground">
                {kind === "followers"
                  ? "When people follow this account, they'll show up here."
                  : "Accounts this user follows will show up here."}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {users.map((user, index) => (
                <li key={user.toText()}>
                  <UserResultRow
                    userId={user}
                    ocid={`profile.${kind}.item.${index + 1}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

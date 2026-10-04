import type { UserProfile, UserSummary } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCount, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface ProfileHeaderProps {
  /** The profile being viewed. */
  profile: UserProfile;
  /** Counts and follow state for the profile. */
  summary: UserSummary | null;
  /** Number of reels the user has posted. */
  postCount: number;
  /** True when the viewer is looking at their own profile. */
  isSelf: boolean;
  /** Follow/unfollow is in flight. */
  isFollowPending: boolean;
  /** Toggle follow state for the viewed user. */
  onToggleFollow: () => void;
  /** Open the edit-profile dialog (self only). */
  onEdit: () => void;
  /** Open the followers list. */
  onOpenFollowers: () => void;
  /** Open the following list. */
  onOpenFollowing: () => void;
}

/**
 * Profile identity block: gradient-ring avatar, display name, @username, bio,
 * and a Posts / Followers / Following stat row. Followers and Following are
 * tappable and open their respective lists. Self profiles show Edit Profile;
 * other profiles show a Follow / Following pill.
 */
export function ProfileHeader({
  profile,
  summary,
  postCount,
  isSelf,
  isFollowPending,
  onToggleFollow,
  onEdit,
  onOpenFollowers,
  onOpenFollowing,
}: ProfileHeaderProps) {
  const isFollowing = summary?.isFollowing ?? false;
  const followerCount = summary?.followerCount ?? 0n;
  const followingCount = summary?.followingCount ?? 0n;

  return (
    <header
      data-ocid="profile.header"
      className="flex flex-col gap-4 animate-fade-in-up"
    >
      <div className="flex items-center gap-4">
        <span className="relative inline-flex shrink-0 rounded-full bg-gradient-primary p-[3px]">
          <Avatar className="size-20 ring-2 ring-background">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            ) : null}
            <AvatarFallback className="bg-secondary font-display text-2xl font-bold text-secondary-foreground">
              {initials(profile.displayName || profile.username)}
            </AvatarFallback>
          </Avatar>
        </span>

        <div className="min-w-0 flex-1">
          <h1
            data-ocid="profile.display_name"
            className="truncate font-display text-xl font-bold tracking-tight text-foreground"
          >
            {profile.displayName}
          </h1>
          <p
            data-ocid="profile.username"
            className="truncate text-sm font-medium text-accent"
          >
            @{profile.username}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card px-2 py-3 shadow-card-soft">
        <div className="flex flex-col items-center gap-0.5">
          <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Posts
          </dt>
          <dd
            data-ocid="profile.posts_count"
            className="font-mono text-base font-bold text-foreground"
          >
            {formatCount(postCount)}
          </dd>
        </div>

        <button
          type="button"
          data-ocid="profile.followers_button"
          onClick={onOpenFollowers}
          className="flex flex-col items-center gap-0.5 rounded-xl transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Followers
          </span>
          <span className="font-mono text-base font-bold text-foreground">
            {formatCount(followerCount)}
          </span>
        </button>

        <button
          type="button"
          data-ocid="profile.following_button"
          onClick={onOpenFollowing}
          className="flex flex-col items-center gap-0.5 rounded-xl transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Following
          </span>
          <span className="font-mono text-base font-bold text-foreground">
            {formatCount(followingCount)}
          </span>
        </button>
      </dl>

      {profile.bio ? (
        <p
          data-ocid="profile.bio"
          className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
        >
          {profile.bio}
        </p>
      ) : null}

      {isSelf ? (
        <Button
          type="button"
          variant="secondary"
          data-ocid="profile.edit_button"
          onClick={onEdit}
          className="h-10 w-full rounded-full font-semibold"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit Profile
        </Button>
      ) : (
        <Button
          type="button"
          variant={isFollowing ? "secondary" : "default"}
          disabled={isFollowPending || !summary}
          aria-pressed={isFollowing}
          data-ocid="profile.follow_button"
          onClick={onToggleFollow}
          className={cn(
            "h-10 w-full rounded-full font-semibold",
            !isFollowing && "bg-primary text-primary-foreground",
          )}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </header>
  );
}

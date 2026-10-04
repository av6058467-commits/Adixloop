import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Music2, Share2 } from "lucide-react";
import { motion } from "motion/react";

interface ReelActionRailProps {
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatarUrl?: string;
  likeCount: bigint;
  isLiked: boolean;
  commentCount: bigint;
  soundLabel?: string;
  /** Bump this key to replay the heart pop animation. */
  likePulse: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSound: () => void;
  onCreator: () => void;
}

interface RailButtonProps {
  label: string;
  count?: string;
  active?: boolean;
  ocid: string;
  onClick: () => void;
  children: React.ReactNode;
}

function RailButton({
  label,
  count,
  active = false,
  ocid,
  onClick,
  children,
}: RailButtonProps) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="group flex w-12 flex-col items-center gap-1 rounded-2xl outline-none transition-smooth focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-md transition-smooth group-hover:bg-black/50 group-active:scale-90",
          active && "text-primary",
        )}
      >
        {children}
      </span>
      {count ? (
        <span className="font-display text-xs font-semibold text-white drop-shadow">
          {count}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Right-side vertical action rail over a reel: creator avatar, like (with an
 * animated heart pop), comment, share, and sound. Counts update live from the
 * parent's optimistic state.
 */
export function ReelActionRail({
  creatorUsername,
  creatorDisplayName,
  creatorAvatarUrl,
  likeCount,
  isLiked,
  commentCount,
  soundLabel,
  likePulse,
  onLike,
  onComment,
  onShare,
  onSound,
  onCreator,
}: ReelActionRailProps) {
  return (
    <div
      data-ocid="reel.action_rail"
      className="pointer-events-auto flex flex-col items-center gap-4"
    >
      <button
        type="button"
        data-ocid="reel.creator_button"
        aria-label={`View ${creatorDisplayName}'s profile`}
        onClick={onCreator}
        className="rounded-full outline-none transition-smooth focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-11 ring-2 ring-white/80">
          {creatorAvatarUrl ? (
            <AvatarImage src={creatorAvatarUrl} alt={creatorDisplayName} />
          ) : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials(creatorDisplayName || creatorUsername)}
          </AvatarFallback>
        </Avatar>
      </button>

      <RailButton
        label={isLiked ? "Unlike reel" : "Like reel"}
        count={formatCount(likeCount)}
        active={isLiked}
        ocid="reel.like_button"
        onClick={onLike}
      >
        <motion.span
          key={likePulse}
          initial={isLiked ? { scale: 0.6 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="flex items-center justify-center"
        >
          <Heart
            className={cn("size-7", isLiked && "fill-primary text-primary")}
            strokeWidth={2}
          />
        </motion.span>
      </RailButton>

      <RailButton
        label="Open comments"
        count={formatCount(commentCount)}
        ocid="reel.comment_button"
        onClick={onComment}
      >
        <MessageCircle className="size-7 text-white" strokeWidth={2} />
      </RailButton>

      <RailButton label="Share reel" ocid="reel.share_button" onClick={onShare}>
        <Share2 className="size-7 text-white" strokeWidth={2} />
      </RailButton>

      <RailButton
        label={soundLabel ? `Sound: ${soundLabel}` : "Original sound"}
        ocid="reel.sound_button"
        onClick={onSound}
      >
        <Music2 className="size-7 text-white" strokeWidth={2} />
      </RailButton>
    </div>
  );
}

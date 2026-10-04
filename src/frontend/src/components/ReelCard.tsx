import type { ReelView } from "@/backend";
import { ReelActionRail } from "@/components/ReelActionRail";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, normalizeHashtag } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ReelCardProps {
  reel: ReelView;
  /** True when this reel is the active (centered) item in the feed. */
  isActive: boolean;
  isLiked: boolean;
  likeCount: bigint;
  commentCount: bigint;
  /** Bump to replay the heart pop animation. */
  likePulse: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

/**
 * A single full-viewport reel: muted autoplaying video, tap-to-unmute control,
 * bottom-left creator/caption/hashtag block, and the right-side action rail.
 * Playback is driven by the parent's `isActive` flag (IntersectionObserver).
 */
export function ReelCard({
  reel,
  isActive,
  isLiked,
  likeCount,
  commentCount,
  likePulse,
  onLike,
  onComment,
  onShare,
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const navigate = useNavigate();

  // Play only the active reel; pause everything else.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      void video.play().catch(() => {
        /* Autoplay may be blocked until user interaction. */
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  const soundLabel = reel.soundLabel ?? "Original sound";

  return (
    <section
      data-ocid="reel.card"
      className="snap-reel-item relative h-dvh w-full overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        data-ocid="reel.video"
        src={reel.mediaUrl}
        poster={reel.thumbnailUrl}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />

      {/* Legibility scrims */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
      />

      {/* Tap-to-unmute control */}
      <button
        type="button"
        data-ocid="reel.mute_toggle"
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
        onClick={() => setMuted((value) => !value)}
        className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-smooth hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {muted ? (
          <VolumeX className="size-5" />
        ) : (
          <Volume2 className="size-5" />
        )}
      </button>

      {/* Right action rail */}
      <div className="absolute bottom-28 right-3 z-20">
        <ReelActionRail
          creatorUsername={reel.creatorUsername}
          creatorDisplayName={reel.creatorDisplayName}
          creatorAvatarUrl={reel.creatorAvatarUrl}
          likeCount={likeCount}
          isLiked={isLiked}
          commentCount={commentCount}
          soundLabel={reel.soundLabel}
          likePulse={likePulse}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          onSound={() =>
            void navigate({
              to: "/sound/$label",
              params: { label: soundLabel },
            })
          }
          onCreator={() =>
            void navigate({
              to: "/profile/$userId",
              params: { userId: reel.creator.toText() },
            })
          }
        />
      </div>

      {/* Bottom-left creator + caption */}
      <div className="absolute bottom-24 left-4 right-20 z-20 flex flex-col gap-2">
        <Link
          to="/profile/$userId"
          params={{ userId: reel.creator.toText() }}
          data-ocid="reel.creator_link"
          className="flex items-center gap-2"
        >
          <Avatar className="size-8 ring-2 ring-white/70">
            {reel.creatorAvatarUrl ? (
              <AvatarImage
                src={reel.creatorAvatarUrl}
                alt={reel.creatorDisplayName}
              />
            ) : null}
            <AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">
              {initials(reel.creatorDisplayName || reel.creatorUsername)}
            </AvatarFallback>
          </Avatar>
          <span className="font-display text-sm font-semibold text-white drop-shadow">
            @{reel.creatorUsername}
          </span>
        </Link>

        {reel.caption ? (
          <p className="line-clamp-2 text-sm text-white/95 drop-shadow">
            {reel.caption}
          </p>
        ) : null}

        {reel.hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {reel.hashtags.map((tag) => (
              <Link
                key={tag}
                to="/hashtag/$tag"
                params={{ tag: normalizeHashtag(tag) }}
                data-ocid="reel.hashtag_link"
                className="text-sm font-medium text-accent drop-shadow hover:underline"
              >
                #{normalizeHashtag(tag)}
              </Link>
            ))}
          </div>
        ) : null}

        <Link
          to="/sound/$label"
          params={{ label: soundLabel }}
          data-ocid="reel.sound_link"
          className={cn(
            "flex items-center gap-1.5 text-xs text-white/80 hover:text-white",
          )}
        >
          <Volume2 className="size-3.5" />
          <span className="truncate">{soundLabel}</span>
        </Link>
      </div>
    </section>
  );
}

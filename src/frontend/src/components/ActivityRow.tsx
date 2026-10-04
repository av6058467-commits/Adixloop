import type { Activity } from "@/backend";
import { ActivityKind } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { AtSign, Heart, MessageCircle, UserPlus } from "lucide-react";

interface ActivityRowProps {
  activity: Activity;
  /** 1-based position, used for deterministic test markers. */
  index: number;
}

const KIND_META: Record<
  ActivityKind,
  { icon: typeof Heart; label: string; tint: string }
> = {
  [ActivityKind.like]: {
    icon: Heart,
    label: "liked your reel",
    tint: "text-primary",
  },
  [ActivityKind.comment]: {
    icon: MessageCircle,
    label: "commented",
    tint: "text-accent",
  },
  [ActivityKind.follow]: {
    icon: UserPlus,
    label: "started following you",
    tint: "text-accent",
  },
  [ActivityKind.mention]: {
    icon: AtSign,
    label: "mentioned you",
    tint: "text-accent",
  },
};

/**
 * A single inbox activity row: actor avatar with a kind badge, actor username,
 * a short preview line, and a relative timestamp. Tapping navigates to the
 * related reel (likes/comments/mentions) or the actor's profile (follows).
 */
export function ActivityRow({ activity, index }: ActivityRowProps) {
  const meta = KIND_META[activity.kind];
  const Icon = meta.icon;
  const displayName = activity.actorDisplayName || activity.actorUsername;

  const preview =
    activity.preview && activity.preview.trim().length > 0
      ? activity.preview
      : meta.label;

  const target =
    activity.kind === ActivityKind.follow || activity.reelId === undefined
      ? {
          to: "/profile/$userId" as const,
          params: { userId: activity.actorId.toText() },
        }
      : {
          to: "/" as const,
          search: { reel: activity.reelId.toString() },
        };

  return (
    <li data-ocid={`inbox.row.${index}`}>
      <Link
        {...target}
        data-ocid={`inbox.row_link.${index}`}
        className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative shrink-0">
          <Avatar className="size-11 ring-2 ring-border transition-smooth group-hover:ring-primary/60">
            {activity.actorAvatarUrl ? (
              <AvatarImage src={activity.actorAvatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-card",
              meta.tint,
            )}
          >
            <Icon className="size-3" strokeWidth={2.5} />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-1.5">
            <span className="truncate font-display text-sm font-semibold text-foreground">
              {activity.actorUsername}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {meta.label}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {preview}
          </span>
        </span>

        <span className="shrink-0 self-start pt-1 text-xs text-muted-foreground">
          {formatRelativeTime(activity.createdAt)}
        </span>
      </Link>
    </li>
  );
}

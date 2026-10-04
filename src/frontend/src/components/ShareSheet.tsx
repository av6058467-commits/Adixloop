import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { Check, Copy, Link2, MessageCircle, Send, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareSheetProps {
  reelId: bigint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequireAuth: () => void;
}

/**
 * Bottom sheet with share destinations for a reel. Copying the link writes to
 * the clipboard and shows an inline confirmation; signed-out visitors are
 * prompted to sign in first.
 */
export function ShareSheet({
  reelId,
  open,
  onOpenChange,
  onRequireAuth,
}: ShareSheetProps) {
  const { auth } = useApp();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    reelId !== null && typeof window !== "undefined"
      ? `${window.location.origin}/?reel=${reelId.toString()}`
      : "";

  const requireAuth = (): boolean => {
    if (!auth.isAuthenticated) {
      onRequireAuth();
      return false;
    }
    return true;
  };

  const handleCopy = async () => {
    if (!requireAuth()) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (!requireAuth()) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
      } catch {
        /* User dismissed the native share sheet. */
      }
    } else {
      await handleCopy();
    }
  };

  const destinations = [
    {
      label: "Copy link",
      icon: copied ? Check : Copy,
      ocid: "share.copy_button",
      onClick: handleCopy,
    },
    {
      label: "Send to chat",
      icon: MessageCircle,
      ocid: "share.chat_button",
      onClick: () => {
        if (requireAuth()) void handleCopy();
      },
    },
    {
      label: "Share to feed",
      icon: Send,
      ocid: "share.feed_button",
      onClick: () => {
        if (requireAuth()) void handleCopy();
      },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        data-ocid="share.sheet"
        className="gap-0 rounded-t-3xl border-border bg-card p-0"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-center font-display text-base">
            Share reel
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-3 px-4 py-5">
          {destinations.map((destination) => {
            const Icon = destination.icon;
            return (
              <button
                key={destination.ocid}
                type="button"
                data-ocid={destination.ocid}
                onClick={destination.onClick}
                className="flex flex-col items-center gap-2 rounded-2xl p-3 outline-none transition-smooth hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-foreground">
                  {destination.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            data-ocid="share.native_button"
            onClick={handleNativeShare}
            className="w-full rounded-full"
          >
            <Share2 className="size-4" />
            Share via…
          </Button>
          {copied ? (
            <p
              data-ocid="share.success_state"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-success"
            >
              <Link2 className="size-4" />
              Link copied to clipboard
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

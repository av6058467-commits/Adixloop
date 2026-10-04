import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  /** Optional header title. */
  title?: string;
  /** Hide the top header entirely (used by the full-bleed reels feed). */
  hideHeader?: boolean;
  /** Hide the bottom navigation (used by splash / onboarding). */
  hideNav?: boolean;
  /** Render a back button in the header. */
  back?: boolean;
  /** Remove the default max-width and padding for full-bleed content. */
  fullBleed?: boolean;
  /** Extra classes for the main content region. */
  contentClassName?: string;
}

/**
 * Shared application shell: sticky top header, scrollable content region, and
 * fixed bottom navigation. Header and nav use distinct `bg-card` surfaces so
 * the `bg-background` content zone reads as a separate layer.
 */
export function Layout({
  children,
  title,
  hideHeader = false,
  hideNav = false,
  back = false,
  fullBleed = false,
  contentClassName,
}: LayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {hideHeader ? null : <AppHeader title={title} back={back} />}

      <main
        data-ocid="app.content"
        className={cn(
          "flex-1",
          !fullBleed && "mx-auto w-full max-w-lg px-4 py-4",
          hideNav ? "" : "pb-20",
          contentClassName,
        )}
      >
        {children}
      </main>

      {hideNav ? null : <BottomNav />}
    </div>
  );
}

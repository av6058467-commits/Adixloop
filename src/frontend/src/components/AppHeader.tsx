import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { initials } from "@/lib/format";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Settings } from "lucide-react";

interface AppHeaderProps {
  /** Optional title shown on the left (e.g. "Home"). */
  title?: string;
  /** Show the search affordance linking to /discover. */
  showSearch?: boolean;
  /** Render a back button instead of the brand mark. */
  back?: boolean;
}

/**
 * Top navigation bar. Brand mark + optional title on the left, search and
 * settings/profile affordances on the right. Uses the design system's
 * `bg-card/80 backdrop-blur` top-nav zone.
 */
export function AppHeader({
  title,
  showSearch = true,
  back = false,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { profile, auth } = useApp();

  return (
    <header
      data-ocid="app.header"
      className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl"
    >
      <div className="flex min-w-0 items-center gap-2">
        {back ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Go back"
            data-ocid="app.back_button"
            className="rounded-full"
            onClick={() => navigate({ to: "/" })}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        ) : (
          <Link
            to="/"
            data-ocid="app.brand_link"
            className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight"
          >
            <span className="text-foreground">Adix</span>
            <span className="text-gradient-primary">Loop</span>
          </Link>
        )}
        {title ? (
          <span className="truncate font-display text-base font-semibold text-foreground">
            {title}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        {showSearch ? (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full"
            data-ocid="app.search_button"
          >
            <Link to="/discover" aria-label="Search">
              <Search className="size-5" />
            </Link>
          </Button>
        ) : null}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full"
          data-ocid="app.settings_button"
        >
          <Link to="/settings" aria-label="Settings">
            <Settings className="size-5" />
          </Link>
        </Button>
        {auth.isAuthenticated && profile ? (
          <Link
            to="/profile/$userId"
            params={{ userId: profile.id.toText() }}
            data-ocid="app.profile_link"
            aria-label="Your profile"
            className="ml-1"
          >
            <Avatar className="size-8 ring-2 ring-primary">
              {profile.avatarUrl ? (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                />
              ) : null}
              <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                {initials(profile.displayName || profile.username)}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : null}
      </div>
    </header>
  );
}

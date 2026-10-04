import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home, Inbox, PlusSquare, User } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  /** Route prefixes that should light this tab. */
  match: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home, match: ["/", "/sound", "/hashtag"] },
  { to: "/discover", label: "Discover", icon: Compass, match: ["/discover"] },
  { to: "/create", label: "Create", icon: PlusSquare, match: ["/create"] },
  { to: "/inbox", label: "Inbox", icon: Inbox, match: ["/inbox"] },
  { to: "/profile", label: "Profile", icon: User, match: ["/profile"] },
];

/**
 * Fixed bottom navigation with active-tab highlighting. The active tab uses
 * the neon-pink primary token; inactive tabs use muted-foreground.
 */
export function BottomNav() {
  const { auth } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (item: NavItem) =>
    item.match.some((prefix) =>
      prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
    );

  return (
    <nav
      data-ocid="app.bottom_nav"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const requiresAuth = item.to !== "/" && item.to !== "/discover";
          // The Profile tab has no index route; resolve it to the signed-in
          // user's profile, or to /login when signed out.
          const target =
            item.to === "/profile"
              ? auth.principal
                ? `/profile/${auth.principal}`
                : "/login"
              : requiresAuth && !auth.isAuthenticated
                ? "/login"
                : item.to;

          return (
            <li key={item.to} className="flex flex-1">
              <Link
                to={target}
                data-ocid={`app.nav.${item.label.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-smooth",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative flex items-center justify-center">
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 size-9 rounded-full bg-primary/15 blur-md"
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      "size-6 transition-transform group-active:scale-90",
                      active &&
                        "drop-shadow-[0_0_8px_oklch(0.66_0.28_357/0.7)]",
                    )}
                    strokeWidth={active ? 2.4 : 2}
                  />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

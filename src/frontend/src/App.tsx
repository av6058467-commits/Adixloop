import { OnboardingPrompt } from "@/components/OnboardingPrompt";
import { SplashScreen } from "@/components/SplashScreen";
import { AppProvider, useApp } from "@/context/AppContext";
import { CreatePage } from "@/pages/CreatePage";
import { DiscoverPage } from "@/pages/DiscoverPage";
import { FeedPage } from "@/pages/FeedPage";
import { HashtagPage } from "@/pages/HashtagPage";
import { InboxPage } from "@/pages/InboxPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SoundPage } from "@/pages/SoundPage";
import { WalletPage } from "@/pages/WalletPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Route tree                                                          */
/* ------------------------------------------------------------------ */

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FeedPage,
  validateSearch: (search: Record<string, unknown>): { reel?: string } => ({
    reel: typeof search.reel === "string" ? search.reel : undefined,
  }),
});

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discover",
  component: DiscoverPage,
});

const createPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreatePage,
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inbox",
  component: InboxPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$userId",
  component: ProfilePage,
});

const soundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sound/$label",
  component: SoundPage,
});

const hashtagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hashtag/$tag",
  component: HashtagPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPrompt,
});

const routeTree = rootRoute.addChildren([
  feedRoute,
  discoverRoute,
  createPageRoute,
  inboxRoute,
  walletRoute,
  settingsRoute,
  profileRoute,
  soundRoute,
  hashtagRoute,
  loginRoute,
  onboardingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

function AppShell() {
  const { auth } = useApp();
  const [splashDone, setSplashDone] = useState(false);

  // Auto-advance the splash after a short beat.
  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!splashDone || auth.isInitializing) {
    return <SplashScreen />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

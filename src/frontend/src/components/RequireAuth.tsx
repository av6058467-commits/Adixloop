import { SplashScreen } from "@/components/SplashScreen";
import { useApp } from "@/context/AppContext";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Route guard for protected pages (Profile, Create, Inbox, Wallet).
 * Redirects signed-out visitors to /login and shows the splash while the
 * identity is still being restored.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { auth } = useApp();

  if (auth.isInitializing) {
    return <SplashScreen />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

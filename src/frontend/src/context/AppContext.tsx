import type { UserProfile } from "@/backend";
import { type AuthState, useAuth } from "@/hooks/useAuth";
import { type ReactNode, createContext, useContext, useMemo } from "react";

interface AppContextValue {
  auth: AuthState;
  /** Convenience: the signed-in user's profile, or null. */
  profile: UserProfile | null;
  /** Convenience: the signed-in user's principal text, or null. */
  principal: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const value = useMemo<AppContextValue>(
    () => ({
      auth,
      profile: auth.profile,
      principal: auth.principal,
    }),
    [auth],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

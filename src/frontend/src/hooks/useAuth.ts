import type { UserProfile } from "@/backend";
import { createActor } from "@/lib/backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export interface AuthState {
  /** True once a valid, non-anonymous identity is present (login or restored). */
  isAuthenticated: boolean;
  /** True while the identity is being restored from storage on first load. */
  isInitializing: boolean;
  /** True while an interactive login popup is in progress. */
  isLoggingIn: boolean;
  /** The caller's principal, or null when signed out. */
  principal: string | null;
  /** The caller's profile, or null when signed out or not yet created. */
  profile: UserProfile | null;
  /** True while the profile query is loading for a signed-in user. */
  isProfileLoading: boolean;
  /** True when signed in but no profile exists yet (first-time user). */
  needsProfile: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Shared auth hook wrapping Internet Identity plus the caller's profile.
 * `needsProfile` drives the first-time onboarding prompt.
 */
export function useAuth(): AuthState {
  const {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    login,
    clear,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);

  const principal = identity?.getPrincipal().toText() ?? null;

  const profileQuery = useQuery({
    queryKey: ["profile", "me", principal],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!actor || !identity) return null;
      return actor.getProfile(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!identity,
  });

  const profile = profileQuery.data ?? null;
  const isProfileLoading =
    isAuthenticated && (profileQuery.isLoading || isFetching);

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    principal,
    profile,
    isProfileLoading,
    needsProfile: isAuthenticated && !isProfileLoading && profile === null,
    login: () => login(),
    logout: () => clear(),
  };
}

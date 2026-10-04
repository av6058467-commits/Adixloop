import type { ProfileUpdate, UserProfile, UserSummary } from "@/backend";
import { createActor } from "@/lib/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Fetch any user's full profile by principal. */
export function useUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["profile", user?.toText() ?? "none"],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!actor || !user) return null;
      return actor.getProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

/** Fetch a user summary (counts + follow state) by principal. */
export function useUserSummary(user: Principal | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["user-summary", user?.toText() ?? "none"],
    queryFn: async (): Promise<UserSummary | null> => {
      if (!actor || !user) return null;
      return actor.getUserSummary(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

/** Create the caller's profile during first-time onboarding. */
export function useCreateProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      username: string;
      displayName: string;
      bio: string;
      avatarUrl: string | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProfile(
        input.username,
        input.displayName,
        input.bio,
        input.avatarUrl,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/** Update the caller's profile. */
export function useUpdateProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: ProfileUpdate) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateProfile(update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

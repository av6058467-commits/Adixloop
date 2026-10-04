import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProfile } from "@/hooks/useProfile";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

/**
 * First-time profile creation prompt. Shown when a signed-in user has no
 * profile yet. Collects username, display name, bio, and an optional avatar URL.
 */
export function OnboardingPrompt() {
  const navigate = useNavigate();
  const createProfile = useCreateProfile();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    username.trim().length >= 3 &&
    displayName.trim().length >= 1 &&
    !createProfile.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    createProfile.mutate(
      {
        username: username.trim().replace(/^@/, ""),
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || null,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            void navigate({ to: "/" });
          } else {
            setError(
              result.err === "usernameTaken"
                ? "That username is already taken."
                : result.err === "invalidUsername"
                  ? "Usernames must be 3–20 letters, numbers, or underscores."
                  : "Could not create your profile. Please try again.",
            );
          }
        },
        onError: () =>
          setError("Could not create your profile. Please try again."),
      },
    );
  };

  return (
    <Layout title="Create your profile" hideNav back>
      <form
        onSubmit={handleSubmit}
        data-ocid="onboarding.form"
        className="flex flex-col gap-5 py-2"
      >
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex size-20 items-center justify-center rounded-full bg-gradient-primary font-display text-2xl font-bold text-primary-foreground">
            {displayName.trim() ? displayName.trim()[0].toUpperCase() : "A"}
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome — set up how you appear on AdixLoop.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-username">Username</Label>
          <Input
            id="onboarding-username"
            data-ocid="onboarding.username_input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourhandle"
            autoComplete="off"
            className="rounded-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-display">Display name</Label>
          <Input
            id="onboarding-display"
            data-ocid="onboarding.display_input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your Name"
            className="rounded-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-bio">Bio</Label>
          <Textarea
            id="onboarding-bio"
            data-ocid="onboarding.bio_input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people what you loop about…"
            rows={3}
            className="rounded-2xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-avatar">Avatar URL (optional)</Label>
          <Input
            id="onboarding-avatar"
            data-ocid="onboarding.avatar_input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className="rounded-full"
          />
        </div>

        {error ? (
          <p
            data-ocid="onboarding.error_state"
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          data-ocid="onboarding.submit_button"
          disabled={!canSubmit}
          className="h-11 rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {createProfile.isPending ? "Creating…" : "Create profile"}
        </Button>
      </form>
    </Layout>
  );
}

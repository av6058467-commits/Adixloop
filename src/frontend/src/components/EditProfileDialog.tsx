import type { ProfileUpdate, UserProfile } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";

interface EditProfileDialogProps {
  /** The profile being edited. */
  profile: UserProfile;
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog requests to open or close. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal for editing the caller's display name, username, bio, and avatar.
 * Inputs are owned as local draft state and only reset when the dialog opens
 * for a fresh edit, so a background refetch never clobbers typing.
 */
export function EditProfileDialog({
  profile,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  // Seed the draft each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setAvatarUrl(profile.avatarUrl ?? "");
    setError(null);
  }, [open, profile]);

  const trimmedUsername = username.trim().replace(/^@/, "");
  const canSubmit =
    trimmedUsername.length >= 3 &&
    displayName.trim().length >= 1 &&
    !updateProfile.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);

    const update: ProfileUpdate = {
      displayName: displayName.trim(),
      username: trimmedUsername,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
    };

    updateProfile.mutate(update, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          onOpenChange(false);
        } else {
          setError(
            result.err === "usernameTaken"
              ? "That username is already taken."
              : result.err === "invalidUsername"
                ? "Usernames must be 3–20 letters, numbers, or underscores."
                : "Could not save your changes. Please try again.",
          );
        }
      },
      onError: () => setError("Could not save your changes. Please try again."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="profile.edit_dialog"
        className="rounded-2xl border-border bg-card"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update how you appear across AdixLoop.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          data-ocid="profile.edit_form"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-display">Display name</Label>
            <Input
              id="edit-display"
              data-ocid="profile.edit.display_input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="rounded-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              data-ocid="profile.edit.username_input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourhandle"
              autoComplete="off"
              className="rounded-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              data-ocid="profile.edit.bio_input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what you loop about…"
              rows={3}
              className="rounded-2xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-avatar">Avatar URL</Label>
            <Input
              id="edit-avatar"
              data-ocid="profile.edit.avatar_input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="rounded-full"
            />
          </div>

          {error ? (
            <p
              data-ocid="profile.edit.error_state"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              data-ocid="profile.edit.cancel_button"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="profile.edit.save_button"
              disabled={!canSubmit}
              className="rounded-full bg-primary text-primary-foreground hover:opacity-90"
            >
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

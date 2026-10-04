import { Audience } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { MapPin, Plus, UserPlus, X } from "lucide-react";
import { useState } from "react";

interface PostOptionsStepProps {
  taggedPeople: string[];
  onTaggedPeopleChange: (people: string[]) => void;
  location: string;
  onLocationChange: (value: string) => void;
  audience: Audience;
  onAudienceChange: (value: Audience) => void;
  allowComments: boolean;
  onAllowCommentsChange: (value: boolean) => void;
  allowDuet: boolean;
  onAllowDuetChange: (value: boolean) => void;
  onSaveDraft: () => void;
  isSavingDraft: boolean;
  draftSaved: boolean;
}

/**
 * Step 3 of the create flow: tag people, add a location, choose the audience,
 * and set comment/duet permissions before publishing or saving a draft.
 */
export function PostOptionsStep({
  taggedPeople,
  onTaggedPeopleChange,
  location,
  onLocationChange,
  audience,
  onAudienceChange,
  allowComments,
  onAllowCommentsChange,
  allowDuet,
  onAllowDuetChange,
  onSaveDraft,
  isSavingDraft,
  draftSaved,
}: PostOptionsStepProps) {
  const [tagDraft, setTagDraft] = useState("");

  const addPerson = () => {
    const person = tagDraft.replace(/^@+/, "").trim();
    if (!person || taggedPeople.includes(person)) {
      setTagDraft("");
      return;
    }
    onTaggedPeopleChange([...taggedPeople, person]);
    setTagDraft("");
  };

  const removePerson = (person: string) => {
    onTaggedPeopleChange(taggedPeople.filter((item) => item !== person));
  };

  return (
    <section data-ocid="create.options_step" className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Post options
        </h2>
        <p className="text-sm text-muted-foreground">
          Control who sees your reel and how people can interact with it.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reel-tag">Tag people</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <UserPlus
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent"
              aria-hidden="true"
            />
            <Input
              id="reel-tag"
              data-ocid="create.tag_input"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPerson();
                }
              }}
              placeholder="@username"
              className="rounded-full bg-card pl-9"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Tag person"
            data-ocid="create.add_tag_button"
            className="rounded-full"
            onClick={addPerson}
            disabled={!tagDraft.replace(/^@+/, "").trim()}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {taggedPeople.length > 0 ? (
          <ul
            data-ocid="create.tagged_list"
            className="flex flex-wrap gap-2 pt-1"
          >
            {taggedPeople.map((person) => (
              <li key={person}>
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full bg-secondary text-secondary-foreground"
                >
                  @{person}
                  <button
                    type="button"
                    aria-label={`Remove tag ${person}`}
                    data-ocid={`create.remove_tag_button.${person}`}
                    className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                    onClick={() => removePerson(person)}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reel-location">Location</Label>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <Input
            id="reel-location"
            data-ocid="create.location_input"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Add a location"
            className="rounded-full bg-card pl-9"
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Audience
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            data-ocid="create.audience.everyone"
            aria-pressed={audience === Audience.everyone}
            onClick={() => onAudienceChange(Audience.everyone)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-smooth",
              audience === Audience.everyone
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50",
            )}
          >
            <span className="block text-sm font-medium text-foreground">
              Everyone
            </span>
            <span className="block text-xs text-muted-foreground">
              Anyone on AdixLoop
            </span>
          </button>
          <button
            type="button"
            data-ocid="create.audience.followers"
            aria-pressed={audience === Audience.followers}
            onClick={() => onAudienceChange(Audience.followers)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-smooth",
              audience === Audience.followers
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50",
            )}
          >
            <span className="block text-sm font-medium text-foreground">
              Followers
            </span>
            <span className="block text-xs text-muted-foreground">
              Only your followers
            </span>
          </button>
        </div>
      </fieldset>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="allow-comments" className="text-foreground">
              Allow comments
            </Label>
            <p className="text-xs text-muted-foreground">
              Let people reply to your reel.
            </p>
          </div>
          <Switch
            id="allow-comments"
            data-ocid="create.allow_comments_switch"
            checked={allowComments}
            onCheckedChange={onAllowCommentsChange}
          />
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="allow-duet" className="text-foreground">
              Allow duet
            </Label>
            <p className="text-xs text-muted-foreground">
              Let others create alongside your reel.
            </p>
          </div>
          <Switch
            id="allow-duet"
            data-ocid="create.allow_duet_switch"
            checked={allowDuet}
            onCheckedChange={onAllowDuetChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          data-ocid="create.save_draft_button"
          className="w-full rounded-full"
          onClick={onSaveDraft}
          disabled={isSavingDraft}
        >
          {isSavingDraft ? "Saving draft…" : "Save to drafts"}
        </Button>
        {draftSaved ? (
          <output
            data-ocid="create.draft_saved_state"
            className="block text-center text-xs text-accent"
          >
            Draft saved. You can resume it any time.
          </output>
        ) : null}
      </div>
    </section>
  );
}

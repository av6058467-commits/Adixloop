import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeHashtag } from "@/lib/format";
import { Hash, Music2, Plus, X } from "lucide-react";
import { useState } from "react";

interface EditReelStepProps {
  caption: string;
  onCaptionChange: (value: string) => void;
  hashtags: string[];
  onHashtagsChange: (tags: string[]) => void;
  soundLabel: string;
  onSoundLabelChange: (value: string) => void;
}

const CAPTION_LIMIT = 2200;

/**
 * Step 2 of the create flow: write the caption, attach hashtags, and label the
 * music or sound used in the reel.
 */
export function EditReelStep({
  caption,
  onCaptionChange,
  hashtags,
  onHashtagsChange,
  soundLabel,
  onSoundLabelChange,
}: EditReelStepProps) {
  const [tagDraft, setTagDraft] = useState("");

  const addTag = () => {
    const tag = normalizeHashtag(tagDraft);
    if (!tag || hashtags.includes(tag)) {
      setTagDraft("");
      return;
    }
    onHashtagsChange([...hashtags, tag]);
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    onHashtagsChange(hashtags.filter((item) => item !== tag));
  };

  return (
    <section data-ocid="create.edit_step" className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Edit your reel
        </h2>
        <p className="text-sm text-muted-foreground">
          Add a caption, hashtags, and the sound behind your clip.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reel-caption">Caption</Label>
        <Textarea
          id="reel-caption"
          data-ocid="create.caption_input"
          value={caption}
          maxLength={CAPTION_LIMIT}
          onChange={(event) => onCaptionChange(event.target.value)}
          placeholder="Say something about this reel…"
          className="min-h-28 resize-none rounded-2xl bg-card"
        />
        <p className="text-right text-xs text-muted-foreground">
          {caption.length}/{CAPTION_LIMIT}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reel-hashtag">Hashtags</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent"
              aria-hidden="true"
            />
            <Input
              id="reel-hashtag"
              data-ocid="create.hashtag_input"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="reels, dance, nightout"
              className="rounded-full bg-card pl-9"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Add hashtag"
            data-ocid="create.add_hashtag_button"
            className="rounded-full"
            onClick={addTag}
            disabled={!normalizeHashtag(tagDraft)}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {hashtags.length > 0 ? (
          <ul
            data-ocid="create.hashtag_list"
            className="flex flex-wrap gap-2 pt-1"
          >
            {hashtags.map((tag) => (
              <li key={tag}>
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full bg-accent/15 text-accent"
                >
                  #{tag}
                  <button
                    type="button"
                    aria-label={`Remove hashtag ${tag}`}
                    data-ocid={`create.remove_hashtag_button.${tag}`}
                    className="rounded-full p-0.5 transition-colors hover:bg-accent/25"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Hashtags help people discover your reel.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reel-sound">Music / sound</Label>
        <div className="relative">
          <Music2
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <Input
            id="reel-sound"
            data-ocid="create.sound_input"
            value={soundLabel}
            onChange={(event) => onSoundLabelChange(event.target.value)}
            placeholder="Original audio, or a track name"
            className="rounded-full bg-card pl-9"
          />
        </div>
      </div>
    </section>
  );
}

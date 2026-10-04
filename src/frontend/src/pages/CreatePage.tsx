import { Audience, type Draft, type DraftInput } from "@/backend";
import { DraftsList } from "@/components/DraftsList";
import { EditReelStep } from "@/components/EditReelStep";
import { Layout } from "@/components/Layout";
import { PostOptionsStep } from "@/components/PostOptionsStep";
import { RequireAuth } from "@/components/RequireAuth";
import {
  type MediaKind,
  UploadStep,
  type UploadedMedia,
} from "@/components/UploadStep";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createActor } from "@/lib/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Upload",
  2: "Edit",
  3: "Options",
};

/** Create & post reel flow: upload, edit, options, and saved drafts. */
export function CreatePage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [view, setView] = useState<"compose" | "drafts">("compose");
  const [step, setStep] = useState<Step>(1);

  // Step 1 — media
  const [kind, setKind] = useState<MediaKind | null>(null);
  const [uploaded, setUploaded] = useState<UploadedMedia | null>(null);

  // Step 2 — edit
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [soundLabel, setSoundLabel] = useState("");

  // Step 3 — options
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState<Audience>(Audience.everyone);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [draftSaved, setDraftSaved] = useState(false);

  // The draft currently being edited, if resumed from the drafts list.
  const [editingDraftId, setEditingDraftId] = useState<bigint | null>(null);

  const draftsQuery = useQuery({
    queryKey: ["drafts"],
    queryFn: async (): Promise<Draft[]> => {
      if (!actor) return [];
      return actor.listDrafts();
    },
    enabled: !!actor && !isFetching,
  });

  const createReel = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      if (!uploaded) throw new Error("Upload a video or photo first");
      const result = await actor.createReel({
        mediaUrl: uploaded.url,
        thumbnailUrl: uploaded.kind === "photo" ? uploaded.url : undefined,
        caption: caption.trim(),
        hashtags,
        soundLabel: soundLabel.trim() || undefined,
        location: location.trim() || undefined,
        audience,
        allowComments,
        allowDuet,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["reels-by-user"] });
      toast.success("Reel posted to your feed");
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not post your reel",
      );
    },
  });

  const saveDraft = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      const input: DraftInput = {
        mediaUrl: uploaded?.url,
        thumbnailUrl: uploaded?.kind === "photo" ? uploaded.url : undefined,
        caption: caption.trim(),
        hashtags,
        soundLabel: soundLabel.trim() || undefined,
        location: location.trim() || undefined,
        audience,
        allowComments,
        allowDuet,
      };
      const result = await actor.saveDraft(editingDraftId, input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (draft) => {
      setEditingDraftId(draft.id);
      setDraftSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Draft saved");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not save draft",
      );
    },
  });

  const deleteDraft = useMutation({
    mutationFn: async (draftId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.deleteDraft(draftId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_data, draftId) => {
      if (editingDraftId === draftId) {
        setEditingDraftId(null);
      }
      void queryClient.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Draft deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not delete draft",
      );
    },
  });

  const resetCompose = () => {
    setStep(1);
    setKind(null);
    setUploaded(null);
    setCaption("");
    setHashtags([]);
    setSoundLabel("");
    setTaggedPeople([]);
    setLocation("");
    setAudience(Audience.everyone);
    setAllowComments(true);
    setAllowDuet(true);
    setDraftSaved(false);
    setEditingDraftId(null);
  };

  const resumeDraft = (draft: Draft) => {
    setEditingDraftId(draft.id);
    setUploaded(
      draft.mediaUrl
        ? {
            url: draft.mediaUrl,
            filename: draft.mediaUrl.split("/").pop() ?? "draft-media",
            contentType: "",
            kind: draft.thumbnailUrl === draft.mediaUrl ? "photo" : "video",
          }
        : null,
    );
    setKind(draft.thumbnailUrl === draft.mediaUrl ? "photo" : "video");
    setCaption(draft.caption);
    setHashtags(draft.hashtags);
    setSoundLabel(draft.soundLabel ?? "");
    setLocation(draft.location ?? "");
    setAudience(draft.audience);
    setAllowComments(draft.allowComments);
    setAllowDuet(draft.allowDuet);
    setDraftSaved(false);
    setView("compose");
    setStep(2);
  };

  const canAdvance = step === 1 ? !!uploaded : true;
  const isPosting = createReel.isPending;

  return (
    <RequireAuth>
      <Layout title="Create">
        <div data-ocid="create.page" className="space-y-5">
          <Tabs
            value={view}
            onValueChange={(value) => setView(value as "compose" | "drafts")}
          >
            <TabsList
              data-ocid="create.view_tabs"
              className="grid w-full grid-cols-2 rounded-full bg-secondary p-1"
            >
              <TabsTrigger
                value="compose"
                data-ocid="create.compose_tab"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                New reel
              </TabsTrigger>
              <TabsTrigger
                value="drafts"
                data-ocid="create.drafts_tab"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Drafts
                {draftsQuery.data && draftsQuery.data.length > 0 ? (
                  <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-xs">
                    {draftsQuery.data.length}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {view === "drafts" ? (
            <section data-ocid="create.drafts_panel" className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Your drafts
                </h2>
                <p className="text-sm text-muted-foreground">
                  Resume a saved reel or delete the ones you no longer need.
                </p>
              </div>
              <DraftsList
                drafts={draftsQuery.data ?? []}
                isLoading={draftsQuery.isLoading}
                onResume={resumeDraft}
                onDelete={(draftId) => deleteDraft.mutate(draftId)}
                deletingId={
                  deleteDraft.isPending ? (deleteDraft.variables ?? null) : null
                }
              />
            </section>
          ) : (
            <div className="space-y-5">
              <ol
                data-ocid="create.step_indicator"
                className="flex items-center gap-2"
              >
                {([1, 2, 3] as Step[]).map((value) => (
                  <li key={value} className="flex flex-1 items-center gap-2">
                    <span
                      className={
                        value <= step
                          ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                          : "flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {value}
                    </span>
                    <span
                      className={
                        value === step
                          ? "text-xs font-medium text-foreground"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {STEP_LABELS[value]}
                    </span>
                    {value < 3 ? (
                      <span
                        className="h-px flex-1 bg-border"
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                ))}
              </ol>

              {step === 1 ? (
                <UploadStep
                  kind={kind}
                  onKindChange={setKind}
                  uploaded={uploaded}
                  onUploaded={(media) => {
                    setUploaded(media);
                    setDraftSaved(false);
                  }}
                  onClear={() => {
                    setUploaded(null);
                    setDraftSaved(false);
                  }}
                />
              ) : null}

              {step === 2 ? (
                <EditReelStep
                  caption={caption}
                  onCaptionChange={(value) => {
                    setCaption(value);
                    setDraftSaved(false);
                  }}
                  hashtags={hashtags}
                  onHashtagsChange={(tags) => {
                    setHashtags(tags);
                    setDraftSaved(false);
                  }}
                  soundLabel={soundLabel}
                  onSoundLabelChange={(value) => {
                    setSoundLabel(value);
                    setDraftSaved(false);
                  }}
                />
              ) : null}

              {step === 3 ? (
                <PostOptionsStep
                  taggedPeople={taggedPeople}
                  onTaggedPeopleChange={setTaggedPeople}
                  location={location}
                  onLocationChange={setLocation}
                  audience={audience}
                  onAudienceChange={setAudience}
                  allowComments={allowComments}
                  onAllowCommentsChange={setAllowComments}
                  allowDuet={allowDuet}
                  onAllowDuetChange={setAllowDuet}
                  onSaveDraft={() => saveDraft.mutate()}
                  isSavingDraft={saveDraft.isPending}
                  draftSaved={draftSaved}
                />
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="create.back_button"
                    className="rounded-full"
                    onClick={() => setStep((step - 1) as Step)}
                    disabled={isPosting}
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    data-ocid="create.reset_button"
                    className="rounded-full"
                    onClick={resetCompose}
                    disabled={isPosting}
                  >
                    Reset
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    data-ocid="create.next_button"
                    className="flex-1 rounded-full"
                    onClick={() => setStep((step + 1) as Step)}
                    disabled={!canAdvance}
                  >
                    Next
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    data-ocid="create.post_button"
                    className="flex-1 rounded-full"
                    onClick={() => createReel.mutate()}
                    disabled={isPosting || !uploaded}
                  >
                    <Send className="size-4" aria-hidden="true" />
                    {isPosting ? "Posting…" : "Post reel"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}

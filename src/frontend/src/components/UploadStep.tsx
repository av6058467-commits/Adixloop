import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { loadConfig } from "@caffeineai/core-infrastructure";
import { ExternalBlob, StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { ImagePlus, Loader2, RotateCcw, Upload, Video } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export type MediaKind = "video" | "photo";

export interface UploadedMedia {
  url: string;
  filename: string;
  contentType: string;
  kind: MediaKind;
}

interface UploadStepProps {
  kind: MediaKind | null;
  onKindChange: (kind: MediaKind) => void;
  onUploaded: (media: UploadedMedia) => void;
  uploaded: UploadedMedia | null;
  onClear: () => void;
}

const ACCEPT: Record<MediaKind, string> = {
  video: "video/*,.mp4,.mov,.webm,.m4v",
  photo: "image/*,.jpg,.jpeg,.png,.webp",
};
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

function validateFile(file: File, kind: MediaKind): string | null {
  const name = file.name.toLowerCase();
  const videoExt = /\.(mp4|mov|webm|m4v)$/i.test(name);
  const photoExt = /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name);
  const isVideo = file.type.startsWith("video/") || videoExt;
  const isPhoto = file.type.startsWith("image/") || photoExt;

  if (kind === "video" && !isVideo) return "Choose a video file (MP4, MOV, WebM, or M4V).";
  if (kind === "photo" && !isPhoto) return "Choose an image file (JPG, PNG, or WebP).";
  if (kind === "video" && file.size > MAX_VIDEO_BYTES) return "Video is too large. Maximum size is 100 MB.";
  if (kind === "photo" && file.size > MAX_PHOTO_BYTES) return "Image is too large. Maximum size is 15 MB.";
  if (file.size === 0) return "This file is empty. Choose another file.";
  return null;
}

export function UploadStep({
  kind,
  onKindChange,
  onUploaded,
  uploaded,
  onClear,
}: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!kind) return;
    const validationError = validateFile(file, kind);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);
    setPendingName(file.name);
    try {
      const config = await loadConfig();
      if (
        !config?.backend_host ||
        !config?.bucket_name ||
        !config?.storage_gateway_url ||
        !config?.backend_canister_id ||
        !config?.project_id
      ) {
        throw new Error("Upload storage is not configured. Check the app environment settings.");
      }

      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host.includes("localhost")) {
        await agent.fetchRootKey();
      }

      const client = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes, file.type, file.name)
        .withUploadProgress((pct) => setProgress(Math.min(100, Math.max(0, pct))));

      const { hash } = await client.putFile(
        await blob.getBytes(),
        (pct) => setProgress(Math.min(100, Math.max(0, pct))),
        file.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
        file.name,
      );
      if (!hash) throw new Error("Storage did not return a file ID. Please retry.");

      const url = await client.getDirectURL(hash);
      if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error("Storage uploaded the file but returned an invalid media URL.");
      }

      onUploaded({
        url,
        filename: file.name,
        contentType: file.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
        kind,
      });
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false);
      setPendingName(null);
    }
  }, [kind, onUploaded]);

  const openPicker = () => inputRef.current?.click();

  return (
    <section data-ocid="create.upload_step" className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-foreground">Add your media</h2>
        <p className="text-sm text-muted-foreground">Choose a video or photo, then upload it from your device.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          data-ocid="create.media_kind.video"
          aria-pressed={kind === "video"}
          onClick={() => { setError(null); onKindChange("video"); }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-5 text-sm font-medium transition-smooth",
            kind === "video"
              ? "border-primary bg-primary/10 text-foreground shadow-[0_0_24px_-6px_oklch(0.66_0.28_357/0.6)]"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          <Video className={cn("size-7", kind === "video" && "text-primary")} aria-hidden="true" />
          Video
        </button>
        <button
          type="button"
          data-ocid="create.media_kind.photo"
          aria-pressed={kind === "photo"}
          onClick={() => { setError(null); onKindChange("photo"); }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-5 text-sm font-medium transition-smooth",
            kind === "photo"
              ? "border-primary bg-primary/10 text-foreground shadow-[0_0_24px_-6px_oklch(0.66_0.28_357/0.6)]"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          <ImagePlus className={cn("size-7", kind === "photo" && "text-primary")} aria-hidden="true" />
          Photo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={kind ? ACCEPT[kind] : undefined}
        className="sr-only"
        data-ocid="create.file_input"
        disabled={isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {uploaded ? (
        <div data-ocid="create.upload_preview" className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[9/16] max-h-72 w-full bg-secondary">
            {uploaded.kind === "photo" ? (
              <img src={uploaded.url} alt={uploaded.filename} className="size-full object-cover" />
            ) : (
              <video src={uploaded.url} className="size-full object-cover" muted playsInline controls />
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{uploaded.filename}</p>
              <p className="text-xs text-muted-foreground">Uploaded successfully</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid="create.replace_upload_button"
              className="rounded-full"
              disabled={isUploading}
              onClick={onClear}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Replace
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          data-ocid="create.upload_button"
          disabled={!kind || isUploading}
          onClick={openPicker}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center transition-smooth",
            kind ? "border-primary/60 bg-primary/5 hover:bg-primary/10" : "border-border bg-card opacity-60",
          )}
        >
          {isUploading ? <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" /> : <Upload className="size-8 text-primary" aria-hidden="true" />}
          <span className="text-sm font-medium text-foreground">
            {isUploading ? `Uploading ${pendingName ?? "file"}…` : kind ? `Choose a ${kind} from your device` : "Pick video or photo first"}
          </span>
          <span className="text-xs text-muted-foreground">
            {kind === "video" ? "MP4, MOV, WebM or M4V · max 100 MB" : "JPG, PNG or WebP · max 15 MB"}
          </span>
        </button>
      )}

      {isUploading ? (
        <div data-ocid="create.upload_progress" className="space-y-2">
          <Progress value={progress} aria-label="Upload progress" />
          <p className="text-right text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      ) : null}

      {error ? (
        <p data-ocid="create.upload_error" role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}

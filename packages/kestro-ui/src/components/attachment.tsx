import * as React from "react";
import { File, FileArchive, FileCode, FileSpreadsheet, FileText, Image as ImageIcon, Music, Video, X } from "lucide-react";
import { cn } from "../lib/cn";

export interface AttachmentData {
  id: string;
  name: string;
  /** Size in bytes. */
  size?: number;
  /** MIME type, e.g. "image/png". */
  type?: string;
  /** Preview URL for images (object URL or remote). */
  url?: string;
  /** 0–100 while uploading. */
  progress?: number;
  error?: string;
}

export function formatBytes(bytes?: number) {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileKind(a: AttachmentData) {
  const t = a.type ?? "";
  const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
  if (t.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].includes(ext)) return "image";
  if (t.startsWith("audio/") || ["mp3", "wav", "m4a", "ogg"].includes(ext)) return "audio";
  if (t.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["csv", "xls", "xlsx", "tsv", "numbers"].includes(ext)) return "sheet";
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return "archive";
  if (["js", "ts", "tsx", "jsx", "py", "go", "rs", "json", "html", "css", "java", "rb", "sh"].includes(ext)) return "code";
  if (["pdf", "doc", "docx", "txt", "md", "rtf"].includes(ext) || t.startsWith("text/") || t === "application/pdf") return "doc";
  return "file";
}

const kindStyle: Record<string, { icon: React.ReactNode; cls: string }> = {
  image: { icon: <ImageIcon />, cls: "text-[oklch(0.65_0.15_300)] bg-[oklch(0.65_0.15_300/0.12)]" },
  audio: { icon: <Music />, cls: "text-[oklch(0.65_0.15_340)] bg-[oklch(0.65_0.15_340/0.12)]" },
  video: { icon: <Video />, cls: "text-[oklch(0.65_0.15_20)] bg-[oklch(0.65_0.15_20/0.12)]" },
  sheet: { icon: <FileSpreadsheet />, cls: "text-[oklch(0.65_0.15_150)] bg-[oklch(0.65_0.15_150/0.12)]" },
  archive: { icon: <FileArchive />, cls: "text-[oklch(0.7_0.13_70)] bg-[oklch(0.7_0.13_70/0.12)]" },
  code: { icon: <FileCode />, cls: "text-[oklch(0.65_0.13_250)] bg-[oklch(0.65_0.13_250/0.12)]" },
  doc: { icon: <FileText />, cls: "text-[oklch(0.63_0.18_25)] bg-[oklch(0.63_0.18_25/0.12)]" },
  file: { icon: <File />, cls: "text-kui-fg-muted bg-kui-surface-3" },
};

export interface AttachmentProps {
  attachment: AttachmentData;
  onRemove?: (id: string) => void;
  className?: string;
}

export function Attachment({ attachment: a, onRemove, className }: AttachmentProps) {
  const kind = fileKind(a);
  const style = kindStyle[kind];
  const uploading = a.progress !== undefined && a.progress < 100;
  return (
    <div
      className={cn(
        "group/att relative flex h-12 max-w-60 min-w-0 items-center gap-2.5 overflow-hidden rounded-kui-sm border bg-kui-surface py-1.5 pr-2.5 pl-1.5 animate-kui-pop",
        a.error ? "border-kui-danger/40" : "border-kui-border",
        className,
      )}
      title={a.name}
    >
      {kind === "image" && a.url ? (
        <img src={a.url} alt="" className="size-9 shrink-0 rounded-md object-cover" />
      ) : (
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-4", style.cls)}>
          {style.icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-kui-fg">{a.name}</span>
        <span className={cn("block truncate text-[11px]", a.error ? "text-kui-danger" : "text-kui-fg-subtle")}>
          {a.error ?? (uploading ? `Uploading… ${Math.round(a.progress!)}%` : formatBytes(a.size) || kind.toUpperCase())}
        </span>
      </span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${a.name}`}
          onClick={() => onRemove(a.id)}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-kui-fg-subtle transition-colors hover:bg-kui-surface-3 hover:text-kui-fg"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
      {uploading ? (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-kui-surface-3">
          <span className="block h-full bg-kui-accent transition-[width] duration-300" style={{ width: `${a.progress}%` }} />
        </span>
      ) : null}
    </div>
  );
}

export function AttachmentList({
  attachments,
  onRemove,
  className,
}: {
  attachments: AttachmentData[];
  onRemove?: (id: string) => void;
  className?: string;
}) {
  if (!attachments.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {attachments.map((a) => (
        <Attachment key={a.id} attachment={a} onRemove={onRemove} />
      ))}
    </div>
  );
}

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, ImageOff, MessageSquareQuote, Minus, Plus, RotateCcw, X } from "lucide-react";
import { cn } from "../lib/cn";
import { IconButton } from "./primitives";

export interface ImageItem {
  id?: string;
  src: string;
  alt?: string;
  /** Shown under the image in the lightbox. */
  caption?: React.ReactNode;
  /** Smaller version for grids and thumbnails. Falls back to `src`. */
  thumbnail?: string;
  width?: number;
  height?: number;
}

/* ========================================================================== */
/*                                   Lightbox                                 */
/* ========================================================================== */

export interface LightboxProps {
  images: ImageItem[];
  /** Index of the image to show. */
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
  /** Adds an "Ask about this image" action — e.g. to reference it in the chat composer. */
  onReference?: (image: ImageItem, index: number) => void;
  referenceLabel?: string;
  /** Show a download button. Default true. */
  download?: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Full-screen image viewer with zoom (wheel, pinch, double-click, buttons), pan and keyboard navigation. */
export function Lightbox({
  images,
  index,
  open,
  onOpenChange,
  onIndexChange,
  onReference,
  referenceLabel = "Ask about this image",
  download = true,
}: LightboxProps) {
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pinch = React.useRef<{ d: number; z: number } | null>(null);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const stageRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const count = images.length;
  const img = images[clamp(index, 0, Math.max(0, count - 1))];

  const reset = React.useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const go = React.useCallback(
    (delta: number) => {
      if (count < 2) return;
      onIndexChange?.((index + delta + count) % count);
    },
    [count, index, onIndexChange],
  );

  React.useEffect(() => {
    reset();
    setLoaded(false);
    setFailed(false);
  }, [index, open, reset]);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => clamp(z * 1.4, MIN_ZOOM, MAX_ZOOM));
      else if (e.key === "-") setZoom((z) => clamp(z / 1.4, MIN_ZOOM, MAX_ZOOM));
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open, go, onOpenChange, reset]);

  // Keep the image inside the stage while panning.
  React.useEffect(() => {
    if (zoom <= 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  const zoomAt = (next: number, cx?: number, cy?: number) => {
    const z = clamp(next, MIN_ZOOM, MAX_ZOOM);
    const stage = stageRef.current?.getBoundingClientRect();
    if (stage && cx !== undefined && cy !== undefined) {
      // zoom toward the cursor
      const ox = cx - (stage.left + stage.width / 2);
      const oy = cy - (stage.top + stage.height / 2);
      setPan((p) => ({ x: ox - ((ox - p.x) * z) / zoom, y: oy - ((oy - p.y) * z) / zoom }));
    }
    setZoom(z);
  };

  if (!open || !img || typeof document === "undefined") return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={img.alt ?? "Image viewer"} className="fixed inset-0 z-[100] flex flex-col bg-black/90 text-white animate-kui-fade">
      {/* top bar */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-3">
        <span className="font-mono text-xs text-white/70 tabular-nums">
          {count > 1 ? `${index + 1} / ${count}` : null}
        </span>
        <div className="ml-auto flex items-center gap-1 [&_button]:text-white/80 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
          {onReference ? (
            <button
              type="button"
              onClick={() => {
                onReference(img, index);
                onOpenChange(false);
              }}
              className="mr-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-white/20 px-3 text-[13px] font-medium"
            >
              <MessageSquareQuote className="size-4" /> {referenceLabel}
            </button>
          ) : null}
          <IconButton label="Zoom out" tooltip={false} onClick={() => setZoom((z) => clamp(z / 1.4, MIN_ZOOM, MAX_ZOOM))} disabled={zoom <= MIN_ZOOM}>
            <Minus />
          </IconButton>
          <span className="w-12 text-center font-mono text-xs tabular-nums text-white/70">{Math.round(zoom * 100)}%</span>
          <IconButton label="Zoom in" tooltip={false} onClick={() => setZoom((z) => clamp(z * 1.4, MIN_ZOOM, MAX_ZOOM))} disabled={zoom >= MAX_ZOOM}>
            <Plus />
          </IconButton>
          <IconButton label="Reset zoom" tooltip={false} onClick={reset} disabled={zoom === 1}>
            <RotateCcw />
          </IconButton>
          {download ? (
            <a href={img.src} download target="_blank" rel="noopener noreferrer" aria-label="Download" className="inline-flex size-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white">
              <Download className="size-4" />
            </a>
          ) : null}
          <IconButton ref={closeRef} label="Close" tooltip={false} onClick={() => onOpenChange(false)}>
            <X />
          </IconButton>
        </div>
      </div>

      {/* stage */}
      <div
        ref={stageRef}
        className={cn("relative min-h-0 flex-1 touch-none overflow-hidden select-none", zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
        onClick={(e) => {
          if (e.target === e.currentTarget && zoom === 1) onOpenChange(false);
        }}
        onWheel={(e) => zoomAt(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY)}
        onDoubleClick={(e) => (zoom > 1 ? reset() : zoomAt(2.5, e.clientX, e.clientY))}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom };
          } else if (zoom > 1) drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        }}
        onPointerMove={(e) => {
          if (!pointers.current.has(e.pointerId)) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pinch.current && pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            setZoom(clamp((pinch.current.z * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.d, MIN_ZOOM, MAX_ZOOM));
          } else if (drag.current) {
            setPan({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
          }
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          drag.current = null;
        }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-10">
          {failed ? (
            <div className="flex flex-col items-center gap-2 text-white/60">
              <ImageOff className="size-8" />
              <span className="text-sm">This image couldn't be loaded.</span>
            </div>
          ) : (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt ?? ""}
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={cn("max-h-full max-w-full object-contain shadow-2xl transition-opacity duration-300", loaded ? "opacity-100 animate-kui-pop" : "opacity-0")}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: drag.current || pinch.current ? "none" : "transform 220ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          )}
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur hover:bg-black/60"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur hover:bg-black/60"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {/* caption + thumbnails */}
      <div className="relative z-10 space-y-3 px-4 pt-2 pb-4">
        {img.caption || img.alt ? <p className="mx-auto max-w-2xl text-center text-sm text-white/80">{img.caption ?? img.alt}</p> : null}
        {count > 1 ? (
          <div className="kui-scrollbar flex justify-center gap-2 overflow-x-auto pb-1">
            {images.map((im, i) => (
              <button
                key={im.id ?? im.src + i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                onClick={() => onIndexChange?.(i)}
                className={cn(
                  "size-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-[opacity,border-color] duration-200",
                  i === index ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-90",
                )}
              >
                <img src={im.thumbnail ?? im.src} alt="" className="size-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/* ========================================================================== */
/*                                 ImagePreview                               */
/* ========================================================================== */

export interface ImagePreviewProps {
  image: ImageItem;
  /** Click opens a lightbox. Default true. */
  zoomable?: boolean;
  onReference?: LightboxProps["onReference"];
  /** CSS aspect ratio, e.g. "16/9". Uses the image's own when omitted. */
  aspect?: string;
  className?: string;
}

function Thumb({ image, aspect, className, onClick, overlay }: { image: ImageItem; aspect?: string; className?: string; onClick?: () => void; overlay?: React.ReactNode }) {
  const [state, setState] = React.useState<"loading" | "ok" | "error">("loading");
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={onClick ? `Open ${image.alt ?? "image"}` : undefined}
      className={cn(
        "group/img relative block overflow-hidden rounded-kui-sm border border-kui-border bg-kui-surface-2",
        onClick && "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/50",
        className,
      )}
      style={{ aspectRatio: aspect ?? (image.width && image.height ? `${image.width}/${image.height}` : undefined) }}
    >
      {state === "loading" ? <span className="absolute inset-0 animate-pulse bg-kui-surface-3" /> : null}
      {state === "error" ? (
        <span className="absolute inset-0 flex items-center justify-center text-kui-fg-subtle">
          <ImageOff className="size-5" />
        </span>
      ) : null}
      <img
        src={image.thumbnail ?? image.src}
        alt={image.alt ?? ""}
        loading="lazy"
        onLoad={() => setState("ok")}
        onError={() => setState("error")}
        className={cn(
          "size-full object-cover transition-[opacity,transform] duration-500 ease-kui-out",
          state === "ok" ? "opacity-100" : "opacity-0",
          onClick && "group-hover/img:scale-[1.03]",
        )}
      />
      {overlay}
    </Tag>
  );
}

/** A single image with loading state that opens a zoomable lightbox. */
export function ImagePreview({ image, zoomable = true, onReference, aspect, className }: ImagePreviewProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Thumb image={image} aspect={aspect} className={cn("max-w-md", className)} onClick={zoomable ? () => setOpen(true) : undefined} />
      {zoomable ? <Lightbox images={[image]} index={0} open={open} onOpenChange={setOpen} onReference={onReference} /> : null}
    </>
  );
}

/* ========================================================================== */
/*                                 ImageGallery                               */
/* ========================================================================== */

export interface ImageGalleryProps {
  images: ImageItem[];
  /** Max tiles before a "+N" overflow tile. Default 4. */
  max?: number;
  onReference?: LightboxProps["onReference"];
  className?: string;
}

/** Responsive grid for 1–N images (generated images, screenshots, product photos) with a shared lightbox. */
export function ImageGallery({ images, max = 4, onReference, className }: ImageGalleryProps) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  if (!images.length) return null;
  const shown = images.slice(0, max);
  const extra = images.length - shown.length;
  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const n = shown.length;

  return (
    <>
      <div
        className={cn(
          "grid w-full max-w-xl gap-1.5",
          n === 1 ? "grid-cols-1" : n === 2 ? "grid-cols-2" : n === 3 ? "grid-cols-3" : "grid-cols-2",
          className,
        )}
      >
        {shown.map((im, i) => (
          <Thumb
            key={im.id ?? im.src + i}
            image={im}
            aspect={n === 1 ? undefined : "1/1"}
            onClick={() => openAt(i)}
            className={cn(n === 1 && "max-h-[420px]")}
            overlay={
              extra > 0 && i === shown.length - 1 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-semibold text-white">+{extra}</span>
              ) : null
            }
          />
        ))}
      </div>
      <Lightbox images={images} index={index} open={open} onOpenChange={setOpen} onIndexChange={setIndex} onReference={onReference} />
    </>
  );
}

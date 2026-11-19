import { useState } from "react";
import { Button, ImagePreview, Lightbox } from "kestro-ui";
import { Maximize2 } from "lucide-react";

const images = [
  { src: "images/coast.svg", alt: "Generated: cliffs above the Atlantic", caption: "Generated in 4.2s · 1024×768" },
  { src: "images/night.svg", alt: "Generated: city skyline at night", caption: "Variation 2 · warmer windows" },
];

export default function Example() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      {/* Single image: click to open, wheel / pinch / double-click to zoom */}
      <ImagePreview image={images[0]} aspect="4/3" />

      {/* Or control the lightbox yourself */}
      <div className="flex flex-col items-start justify-center gap-2">
        <p className="text-sm text-kui-fg-muted">Keyboard: ← → to browse, + − 0 to zoom, Esc to close.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
        >
          <Maximize2 /> Open both images
        </Button>
      </div>
      <Lightbox images={images} index={index} onIndexChange={setIndex} open={open} onOpenChange={setOpen} />
    </div>
  );
}

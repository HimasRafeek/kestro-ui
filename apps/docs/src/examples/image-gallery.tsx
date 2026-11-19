import { useState } from "react";
import { ImageGallery, Message, type ImageItem } from "kestro-ui";

const photos: ImageItem[] = [
  { src: "images/rooftops.svg", alt: "Alfama rooftops at sunset", caption: "Option 1 · Casa do Largo terrace, Alfama" },
  { src: "images/coast.svg", alt: "Cliffs above the Atlantic", caption: "Option 2 · Cascais, 40 min by train" },
  { src: "images/forest.svg", alt: "Pine forest in Sintra", caption: "Option 3 · Sintra hills retreat" },
  { src: "images/night.svg", alt: "Baixa at night", caption: "Option 4 · Baixa, walkable to everything" },
];

export default function Example() {
  const [asked, setAsked] = useState<string | null>(null);

  return (
    <div className="w-full max-w-xl space-y-4">
      <Message from="assistant" name="Atlas" avatar={{ appearance: "monogram", color: "accent", name: "Atlas" }}>
        <p className="text-[15px]">Here are four venues that fit 12 people. Click any photo to zoom in.</p>
        <ImageGallery images={photos} max={3} onReference={(img) => setAsked(img.alt ?? "image")} />
      </Message>
      {asked ? <p className="text-sm text-kui-fg-muted">Referenced in the composer: “{asked}”</p> : null}
    </div>
  );
}

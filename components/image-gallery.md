# ImageGallery

> Category: Images · Package: `kestro-ui`

Grid for one or many images in a message, with a shared lightbox and an optional 'Ask about this image' action that references the image in the composer.

## Import

```tsx
import { ImageGallery } from "kestro-ui";
```

## Example: image-gallery

```tsx
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
```

## API

### <ImageGallery />

Responsive grid for 1–N images (generated images, screenshots, product photos) with a shared lightbox.

| Prop | Type | Default | Description |
|---|---|---|---|
| `images` **(required)** | `ImageItem[]` | — |  |
| `max` | `number` | `4` | Max tiles before a "+N" overflow tile. Default 4. |
| `onReference` | `((image: ImageItem, index: number) => void)` | — |  |
| `className` | `string` | — |  |

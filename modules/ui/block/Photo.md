# Photo

A photo block. Renders an `<Image>` in a frame with rounded corners and a black background. Use it for a photo or a screenshot. For artwork with square corners or a transparent background (a logo, an icon), use `<Image>`.

**Things to know:**

- Always set `alt` to describe the photo for screen readers.
- The black background shows while the photo loads. Then the photo fades in over it, the same as `<Image>`.
- The frame clips the photo, so the radius and the border also work while it loads.
- `className`, space and width go on the frame. The photo fills the frame, so give the frame a size (for example an `aspect-ratio`) to crop the photo.
- Composes the `space` and `width` variants.

## Usage

### Photo

```tsx live
import { Photo } from "shelving/ui";

// A small SVG, so the example needs no network. Use any image URL.
const SRC = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><linearGradient id="g"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#a855f7"/></linearGradient><rect width="8" height="5" fill="url(#g)"/></svg>',
)}`;

<Photo src={SRC} alt="A blue to purple gradient" />;
```

## Styling

Override these hooks at `:root`.

| Variable             | Styles                                    | Default                         |
| -------------------- | ----------------------------------------- | ------------------------------- |
| `--photo-radius`     | Corner radius of the frame                | `var(--radius-normal)` (16px)   |
| `--photo-space`      | Outer block margin (top and bottom)       | `var(--space-paragraph)` (16px) |
| `--photo-border`     | Border colour (width is `--photo-stroke`) | `transparent`                   |
| `--photo-stroke`     | Border width (one length)                 | `0px`                           |
| `--photo-background` | Background behind the photo               | `black`                         |

The photo inside also reads the `<Image>` hooks, such as `--image-fade-duration`.

**Global tokens it reads:** `--radius-normal`, `--space-paragraph`.

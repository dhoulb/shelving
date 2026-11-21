# Image

An image block. Renders an `<img>` with rounded corners and a block margin.

**Things to know:**

- Always set `alt` to describe the image for screen readers. Set `alt=""` for an image that is only decoration.
- It loads lazily, and fades in once when it loads. An image that is already loaded when it mounts (for example, from the cache) shows at once with no fade.
- It never holds a page transition. React waits only for an eager `<img>` with no `onLoad`.
- The load state is on the `data-loaded` attribute: none, then `fade`, then `done`. It is set on the element directly, so a load never renders the component again.
- With scripts off, the image shows at once.
- With reduced motion, the image shows with no fade.
- `object-fit: cover` keeps the image in proportion when you give it a fixed size.
- Composes the `space` and `width` variants.
- Inside `<Prose>` a raw `<img>` gets the same box styles.

## Usage

### Image

```tsx live
import { Image } from "shelving/ui";

// A small SVG, so the example needs no network. Use any image URL.
const SRC = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><linearGradient id="g"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#a855f7"/></linearGradient><rect width="8" height="5" fill="url(#g)"/></svg>',
)}`;

<Image src={SRC} alt="A blue to purple gradient" />;
```

### Width

```tsx live
import { Image } from "shelving/ui";

const SRC = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="#f97316"/></svg>',
)}`;

// The `width` variant sets the width of the image.
<Image src={SRC} alt="An orange square" width="12x" />;
```

## Styling

Override these hooks at `:root`.

| Variable                | Styles                                    | Default                          |
| ----------------------- | ----------------------------------------- | -------------------------------- |
| `--image-radius`        | Corner radius                             | `var(--radius-normal)` (16px)    |
| `--image-space`         | Outer block margin (top and bottom)       | `var(--space-paragraph)` (16px)  |
| `--image-border`        | Border colour (width is `--image-stroke`) | `transparent`                    |
| `--image-stroke`        | Border width (one length)                 | `0px`                            |
| `--image-fade-duration` | Length of the fade-in                     | `var(--duration-normal)` (300ms) |

**Global tokens it reads:** `--radius-normal`, `--space-paragraph`, `--duration-normal`.

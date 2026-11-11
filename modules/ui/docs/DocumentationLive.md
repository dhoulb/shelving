# DocumentationLive

Show a code example next to a live preview of it, on a simple phone. The docs site uses it for each fenced code block with a `live` flag.

**Things to know:**

- Add `live` after the language of a fenced code block to make it run: ` ```tsx live `. Put a title in double quotes after it: ` ```tsx live "Card with a link" `. See `parseFencedInfo()` for the full info string format.
- `DOCUMENTATION_LIVE_RULE` finds these blocks. `DOCUMENTATION_MARKUP_RULES` adds it to `TREE_MARKUP_RULES`, and `<DocumentationPage>` renders its content with them.
- The preview is a `<DocumentationFrame>`. It runs in the browser, with the raw shelving styles and none of the docs site styles.
- The code can import from `shelving/*`, `react`, and `react-dom` only. Any other import fails.
- Each top-level expression in the code shows in the preview, so a snippet needs no `return` or export. A default export that is a component or an element shows too.
- The phone is light grey, not the tint colour, so it suggests a device without competing with the preview. Its screen is square, with a fixed height, and scrolls when the preview is taller.
- "Open in playground" under the phone opens the code in `<DocumentationPlaygroundPage>`, where you can change it.

## Usage

### A live example in a Markdown page

````md
```tsx live "A solid button"
import { Button } from "shelving/ui";

<Button solid>Save</Button>
```
````

### A live example with state

````md
```tsx live
import { useState } from "react";
import { Button } from "shelving/ui";

function Counter() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>Clicked {count} times</Button>;
}

<Counter />
```
````

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--documentation-live-bezel` | Space above and below the speaker slot, which sets the thickness of the top and the chin (one length) | `2.25rem` |
| `--documentation-live-body` | Fill of the phone | `oklch(92% 0 0deg)` (light grey) |
| `--documentation-live-detail` | Colour of the speaker slot and home button | `oklch(80% 0 0deg)` |
| `--documentation-live-edge` | Width of the phone edge left and right of the screen (one length) | `0.75rem` |
| `--documentation-live-gap` | Space between the code and the phone (one length) | `var(--space-normal)` (16px) |
| `--documentation-live-height` | Height of the screen (one length) | `26rem` |
| `--documentation-live-radius` | Corner radius of the phone | `2.5rem` |
| `--documentation-live-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |
| `--documentation-live-width` | Width of the phone (one length) | `22rem` |

Global tokens: `--space-normal`, `--space-xsmall`, `--space-paragraph`, `--font-label`, `--size-small`. The code block is a raw `<pre>` with `--preformatted-space` set to `0`, so it takes the other `.prose pre` styles of `<Preformatted>`. The code and phone are side by side when the screen is 75rem or wider.

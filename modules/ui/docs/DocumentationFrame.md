# DocumentationFrame

Show a live preview of TSX and CSS in an `<iframe>` of the playground frame page. `<DocumentationLive>` and `<DocumentationPlaygroundPage>` use it.

**Things to know:**

- The docs build writes the frame page to `frame.html` (`PLAYGROUND_FRAME_PATH`) at the site root. It loads the shelving styles only, so the preview looks as it does in a real app.
- The code and CSS go in the frame URL hash (see `formatPlaygroundHash()`). A new hash runs the code again without a reload.
- The frame page loads the TypeScript compiler from esm.sh to transpile the code, and imports it as a module. Its import map resolves `shelving/*` to the shelving build of the same docs site, and `react` and `react-dom` to esm.sh. Any other import fails.
- The frame grows to fit its content. The frame page posts its height as a `PLAYGROUND_HEIGHT_MESSAGE` message.
- The frame loads lazily, when it scrolls near the screen.

## Usage

```tsx
import { DocumentationFrame } from "shelving/ui";

<DocumentationFrame code={`import { Button } from "shelving/ui";\n<Button>Hi</Button>`} css=":root { --radius-normal: 4px; }" />
```

## Styling

The frame has no border, radius, or margin. It fills the width of its parent, so the parent sets the look around it (see `<DocumentationLive>`). The space around the preview comes from padding inside the frame page.

| Variable | Styles | Default |
|---|---|---|
| `--documentation-frame-background` | Fill behind the frame before it loads | `white` |
| `--documentation-frame-height` | Minimum height (one length) | `4rem` |

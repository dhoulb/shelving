# CenteredLayout

A full-viewport layout that centres its content — vertically and horizontally — inside a narrow max-width column. Good for login, registration, error, and other focused single-purpose pages where the content is the only thing on screen. When the content is taller than the viewport it scrolls vertically, pinned to the top so nothing is clipped.

**Things to know:**

- Pass the `width` variant to resize the centred column (e.g. `width="normal"`, `width="wide"`, or `width="full"` to fill the available width).
- Pass the `padding` (block / top + bottom) and `indent` (inline / left + right) variants to change the space around the content.
- Like the other full-viewport layouts it owns scroll, padding, and safe-area insets so individual pages don't have to.

## Usage

```tsx
import { CenteredLayout, Section } from "shelving/ui";

function LoginPage() {
  return (
    <CenteredLayout width="narrow">
      <Section>
        <LoginForm/>
      </Section>
    </CenteredLayout>
  );
}
```

Layouts compose naturally as `<Router>` route values — wrap a group of routes in a shared layout, then route further inside it.

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--centered-layout-width` | Width of the centred column (capped at 100%) | `var(--width-narrow)` |
| `--centered-layout-padding` | Block (top/bottom) padding of the scroll area | `var(--space-normal)` |
| `--centered-layout-indent` | Inline (left/right) padding of the scroll area | `var(--space-normal)` |
| `--centered-layout-background` | Page background while the layout is mounted | `var(--tint-100)` (white) |
| `--centered-layout-color` | Text colour for the layout | `var(--tint-00)` (black) |

The column width and the scroll-area padding can also be set per-instance via the `width`, `padding`, and `indent` variant props. The outer element owns its scroll, padding, and safe-area behaviour directly — safe-area insets are applied as transparent borders so they stack with (rather than replace) the padding.

**Global tokens it reads** — `--width-narrow`, `--space-normal`, `--tint-100`, and `--tint-00`.

# CenteredLayout

A full-viewport layout that centres its content horizontally inside a narrow max-width column. Good for login, registration, error, and other focused single-purpose pages where the content is the only thing on screen.

**Things to know:**

- Pass `fullWidth` to drop the max-width constraint while keeping the centred positioning — use it when the content itself needs to fill the width.
- Like the other full-viewport layouts it owns scroll, padding, and safe-area insets so individual pages don't have to.

## Usage

```tsx
import { CenteredLayout, Section } from "shelving/ui";

function LoginPage() {
  return (
    <CenteredLayout>
      <Section width="narrow">
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
| `--centered-layout-width` | Max width of the centred column | `var(--width-narrow)` |
| `--centered-layout-space` | Top/bottom padding of the scroll area | `var(--space-normal)` |
| `--centered-layout-padding` | Left/right padding of the scroll area | `var(--space-normal)` |
| `--centered-layout-background` | Page background while the layout is mounted | `var(--tint-100)` (white) |
| `--centered-layout-color` | Text colour for the layout | `var(--tint-00)` (black) |

The max-width cap is dropped entirely when `fullWidth` is set. The outer element owns its scroll, padding, and safe-area behaviour directly — it also reads the `--layout-inset-top` / `-bottom` / `-left` / `-right` hooks owned by `Layout.ts` (`useSafeKeyboardArea()` writes `--layout-inset-bottom`).

**Global tokens it reads** — `--width-narrow`, `--space-normal`, `--tint-100`, and `--tint-00`.

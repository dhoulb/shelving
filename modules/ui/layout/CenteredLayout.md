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
      <Section narrow>
        <LoginForm/>
      </Section>
    </CenteredLayout>
  );
}
```

Layouts compose naturally as [`Router`](/ui/Router) route values — wrap a group of routes in a shared layout, then route further inside it.

## Styling

This layout exposes no own `--centered-layout-*` hooks. The inner column is capped at the global `--width-wide` token (dropped when `fullWidth` is set), and the outer element composes the shared `.layout` behaviour, so it reads the layout hooks `--layout-space`, `--layout-padding`, and `--layout-inset-top` / `-bottom` / `-left` / `-right`.

**Global tokens it reads** — `--width-wide`.

## See also

- [`SidebarLayout`](/ui/SidebarLayout) — the other full-viewport layout, with a fixed side column
- [`Page`](/ui/Page) — sits above layouts in the tree
- [`Router`](/ui/Router) — wrap route groups in a shared layout

# FixedLayout

A full-viewport layout with no chrome: the whole screen is one content slot. It locks the document, so the page behind never scrolls or rubber-bands, and gives a full-height slot inside the safe areas. Use it for log-in and error screens, and other full-screen pages.

**Things to know:**

- It is a frame only. It does not scroll or centre. Fill the slot with `<Scroll vertical cover>`, so the content scrolls inside it.
- Centre the content in the page itself, for example with `<Block middle width="narrow">`: `middle` puts it in the middle of the screen, and it still scrolls when it is taller.
- The slot stays clear of the notch, the home bar and the rounded screen corners (safe-area insets).
- For pages that you move back and forth between, put a `<RouteCache>` around the scroll box, as in `<AppLayout>`.
- Pages, error pages and loading states never render it themselves. Pick it above the router. See "Composing an app" on `<App>`.

## Usage

```tsx
import { Block, FixedLayout, Router, Scroll } from "shelving/ui";

// The signed-out screens: one layout around their own router.
<FixedLayout>
  <Scroll vertical cover>
    <Router routes={{
      "/login": LoginPage,
      "/register": RegisterPage,
    }} />
  </Scroll>
</FixedLayout>

// Each page centres its own content.
function LoginPage() {
  return (
    <Page title="Log in">
      <Block middle width="narrow" padding="xxlarge" indent="normal">
        <LoginForm />
      </Block>
    </Page>
  );
}
```

An app-level error, outside every other layout:

```tsx
import { Catcher, ErrorPage, type ErrorProps, FixedLayout, Scroll } from "shelving/ui";

function AppError({ reason }: ErrorProps) {
  return (
    <FixedLayout>
      <Scroll vertical cover>
        <ErrorPage reason={reason} />
      </Scroll>
    </FixedLayout>
  );
}

<Catcher as={AppError}>…</Catcher>
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--fixed-layout-background` | Page background while the layout is mounted | `var(--tint-100)` (white) |
| `--fixed-layout-color` | Text colour for the layout | `var(--tint-00)` (black) |

**Global tokens it reads** — `--tint-00` and `--tint-100`.

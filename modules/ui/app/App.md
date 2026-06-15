# App

Root component for a client-side Shelving app. `<App>` applies the theme CSS class to `document.body` and provides a `Meta` context so every descendant can read or update page metadata.

Use `<App>` when mounting into an existing HTML page on the client. For server-side rendering where you need the full `<html>` document shell, use [`HTML`](/ui/HTML) instead.

## A minimal app

The smallest single-screen app — `<App>` wraps a layout and some content:

```tsx
import { App, CenteredLayout, Section, Title, Paragraph } from "shelving/ui";

function HelloApp() {
  return (
    <App app="My app">
      <CenteredLayout>
        <Section narrow>
          <Title>Hello</Title>
          <Paragraph>Welcome to the app.</Paragraph>
        </Section>
      </CenteredLayout>
    </App>
  );
}
```

## A routed app

For a multi-page app, wrap the routes in [`Navigation`](/ui/Navigation) and [`Router`](/ui/Router):

```tsx
import { App, Navigation, Router } from "shelving/ui";

export function MyApp() {
  return (
    <App app="My app" root="https://example.com/" url="/">
      <Navigation>
        <Router routes={{
          "/": HomePage,
          "/about": AboutPage,
        }} />
      </Navigation>
    </App>
  );
}
```

`<App>` accepts all `PossibleMeta` props (`app`, `root`, `url`, `title`, `language`, `tags`, etc.) and merges them into the context it provides to children. On mount it adds the theme class to `document.body`, which activates the CSS custom property tokens defined in `App.module.css`; on unmount it removes it.

For a documentation site, hand an extracted tree to [`TreeApp`](/ui/TreeApp) instead — see the [extract](/extract) guide.

## See also

- [`HTML`](/ui/HTML) — the full `<html>` document shell for server-side rendering (vs. `<App>` for client mounts).
- [`Navigation`](/ui/Navigation) and [`Router`](/ui/Router) — client-side routing wrapped inside the app.
- [`CenteredLayout`](/ui/CenteredLayout) and [`SidebarLayout`](/ui/SidebarLayout) — the page layouts that go inside an app.
- [`TreeApp`](/ui/TreeApp) — a ready-made documentation-site root built on the same pieces.

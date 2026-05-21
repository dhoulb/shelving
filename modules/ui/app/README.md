# App

Root component for a client-side Shelving app. `<App>` applies the theme CSS class to `document.body` and provides a `Meta` context so every descendant can read or update page metadata.

Use `<App>` when mounting into an existing HTML page on the client. For server-side rendering where you need the full `<html>` document shell, use [`<HTML>`](/ui/page) instead.

## Usage

```tsx
import { App, Navigation, Router } from "shelving/ui";

export function MyApp() {
  return (
    <App app="My App" root="https://example.com/" url="/">
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

## See also

- [`ui/page`](/ui/page) — `<HTML>` and `<Page>` for the document shell and per-page metadata
- [`ui/layout`](/ui/layout) — `SidebarLayout` and `CenteredLayout`
- [`ui/router`](/ui/router) — `<Navigation>` and `<Router>` for client-side routing

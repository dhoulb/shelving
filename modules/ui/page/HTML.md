# HTML

The full `<html>` document shell, wrapping `<head>` and `<body>`. Use it as the outermost wrapper for server-side rendering — it owns the literal `<head>` (charset, `<base>`, app `<title>`) while per-page hoistable tags come from [`Page`](/ui/Page).

**Things to know:**

- Accepts [`PossibleMeta`](/ui/PossibleMeta) props (`app`, `root`, `url`, `title`, `description`, `language`, `tags`, `links`, `stylesheets`, `modules`, `scripts`) and merges them into the [`Meta`](/ui/Meta) context it provides to children.
- `<base>` lives only here — it is not a hoistable element, unlike the title/meta/link/script tags that [`Page`](/ui/Page) emits and React 19 lifts into this `<head>`.
- Pass the request URL so the tree can match routes during SSR.

## Usage

```tsx
import { HTML, Page } from "shelving/ui";
import { Navigation, Router } from "shelving/ui";

// Server-side render — pass the request URL to <HTML>.
renderToString(
  <HTML app="My App" root="https://example.com/" url={requestUrl} language="en">
    <Navigation>
      <Router routes={{
        "/": HomePage,
        "/about": AboutPage,
      }}/>
    </Navigation>
  </HTML>
);
```

For client-side-only roots that don't need an `<html>` shell, use `<App>` from [`shelving/ui`](/ui) instead.

# Page

Document-level components for the HTML shell and per-page metadata. These three components own the `<html>`, `<head>`, and per-page `<title>` / `<meta>` output for a shelving app.

## Components

| Component | Purpose |
|---|---|
| `<HTML>` | Renders the full `<html>` document shell with `<head>` and `<body>`. Use this as the outermost wrapper for SSR. |
| `<Page>` | Wraps one page inside the app. Merges per-page meta props into context and emits hoistable head tags (title, description, meta, links, scripts) that React 19 lifts into `<head>`. Also updates `window.history` to match the page URL. |
| `<Head>` | Low-level: emits the hoistable tags from the current `Meta` context. `<Page>` renders it automatically — you rarely need it directly. |

`<HTML>` and `<Page>` both accept `PossibleMeta` props (`app`, `root`, `url`, `title`, `description`, `language`, `tags`, `links`, `stylesheets`, `modules`, `scripts`) and merge them into the context they provide to children.

## SSR usage

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

## Per-page metadata

```tsx
function UserPage({ id }: { id: string }) {
  return (
    <Page title="User profile" url={`/users/${id}`} description="View user details.">
      <Section>…</Section>
    </Page>
  );
}
```

The title is composed with the app name from the surrounding context: `"User profile - My App"`.

## How hoisting works

`<Page>` renders `<Head>` inline. React 19 automatically hoists `<title>`, `<meta>`, `<link>`, and `<script>` elements into the document `<head>`, so you don't need a portal. `<base>` is the exception — it is not hoistable and lives only in `<HTML>`.

## See also

- [`app`](/ui/app) — `<App>` for client-side-only roots (no `<html>` shell needed)
- [`router`](/ui/router) — `<Navigation>` and `<Router>` for URL-driven rendering
- [`layout`](/ui/layout) — layouts that go inside `<Page>`

# Router

A pure URL matcher: it reads the current URL from the surrounding `<Meta>` context, matches it against a `routes` table, and renders the matched element. It has no client requirements, so it works for SSR, static rendering, and tests with no `<Navigation>` at all — wrap it in `<Navigation>` on the client to get live URL updates.

**Things to know:**

- Route keys are `AbsolutePath` strings starting with `/`. Placeholders (`{id}`, `:id`, `[id]`, `${id}`, `{{id}}`) are passed to function/component route values as props, merged with URL `?query` params (placeholders win on conflict).
- `<Router>` accepts `PossibleMeta` props (`url`, `base`, etc.) to override the surrounding context — this is how nested routers scope themselves.
- With a `base` set, the path used for matching is the URL after `matchURLPrefix()` strips the base prefix; URLs outside the base render as `null`.
- Pass `fallback` to control no-match behaviour. An explicit `null` renders nothing; leaving it `undefined` throws a `NotFoundError`.
- `<Router>` itself does not cache pages — wrap it in a `<RouteCache>` (or use a layout that already does) to keep recently-visited pages mounted but hidden so back/forward navigation restores their state.

## Usage

### Basic setup

```tsx
import { HTML, Navigation, Router } from "shelving/ui";

<HTML url={initialUrl} root="https://example.com/">
  <Navigation>
    <Router routes={{
      "/": HomePage,
      "/users/{id}": UserPage,
      "/about": AboutPage,
    }}/>
  </Navigation>
</HTML>
```

### Route value types

| Value | Behaviour |
|---|---|
| Component | Rendered as `<Component {...params}/>` with merged placeholder + query props. |
| `AbsolutePath` string | Redirects to that path (placeholders resolved against the source). |
| `ReactElement` | Rendered as-is — use for layout wrapping or composing inner routers. |
| `null` / `false` | Skipped, as if the route were absent — lets a route be conditionally disabled. |

### Placeholder syntax

All forms produce the same matched value — pick whichever reads best:

| Form | Single segment | Catchall (one+ segments, also matches empty) |
|---|---|---|
| Anonymous | `*` (named `"0"`) | `**` / `***` (named `"0"`) |
| Colon | `:name` | `:name*` / `:name**` |
| Single brace | `{name}` | `{...name}` / `{name*}` |
| Square bracket | `[name]` | `[...name]` / `[name*]` |
| Dollar brace | `${name}` | `${...name}` / `${name*}` |
| Double brace | `{{name}}` | `{{...name}}` / `{{name*}}` |

Modifier chars are tolerant: one-or-more stars and three-or-more dots are all equivalent, so `{path*}`, `{path**}`, `{...path}`, and `{....path}` behave the same. Catchall placeholders allow empty values, so a trailing catchall matches the trailing-slash-absent variant — `/files/{...path}` matches `/files`, `/files/`, and `/files/a/b/c`.

### Layout wrapping

Put layout JSX as the route value with another `<Router>` inside. Since `<Router>` reads its URL from `<Meta>`, the inner router sees the same URL.

```tsx
const SIDEBARRED_ROUTES = {
  "/users": <UsersPage/>,
  "/users/{id}": <UserPage/>,
  "/settings": <SettingsPage/>,
};

<Router routes={{
  "/": <HomePage/>,
  "/{...path}": (
    <SidebarLayout sidebar={<Nav/>}>
      <Router routes={SIDEBARRED_ROUTES}/>
    </SidebarLayout>
  ),
}}/>
```

### Section / microsite pattern

A self-contained "section" — its own URL prefix and routes — composes via a catchall plus a function route value that hands the captured sub-path to a nested router as its `url`.

```tsx
const USER_ROUTES = {
  "/": UsersPage,
  "/{id}": UserPage,
  "/{id}/edit": UserEditPage,
};

export function UserRouter({ path = "/" }: { path?: AbsolutePath }) {
  return <Router routes={USER_ROUTES} url={path}/>;
}

// At the call site — the top-level router stays a flat list of section prefixes:
<Router routes={{
  "/": <HomePage/>,
  "/users/{...path}": ({ path }) => <UserRouter path={path}/>,
  "/blog/{...path}":  ({ path }) => <BlogRouter path={path}/>,
}}/>
```

The outer router captures everything under `/users` into `path`; the inner router treats it as its starting URL, so its `"/"` matches the bare `/users` and `/{id}` matches `/users/123`.

### Stacking layouts and sections

The two patterns compose — wrap a group of routes in a layout, then route further inside, handing off to section routers via the catchall:

```tsx
const SIDEBARRED_ROUTES = {
  "/": <Dashboard/>,
  "/users/{...path}": ({ path }) => <UserRouter path={path}/>,
  "/blog/{...path}":  ({ path }) => <BlogRouter path={path}/>,
  "/settings": <SettingsPage/>,
};

<Router routes={{
  "/login": <LoginPage/>,                       // no sidebar
  "/{...path}": (                                // everything else wrapped
    <SidebarLayout sidebar={<Nav/>}>
      <Router routes={SIDEBARRED_ROUTES}/>
    </SidebarLayout>
  ),
}}/>
```

### Keeping page state

By default a page is unmounted when you navigate away and mounted fresh when you return — so scroll position, open/closed toggles, in-progress searches, form inputs, and focus are all lost, and you land back at the top. Wrap the router (or its scrolling content region) in a `<RouteCache>` to keep recently-visited pages mounted but hidden so their state is restored on back/forward navigation. Shelving's `<SidebarLayout>` and `<CenteredLayout>` already do this for you.

### SSR / static rendering

`<Router>` re-renders when context changes and needs no client. For static rendering set `url` and `root` on the outer wrapper and skip `<Navigation>`:

```tsx
renderToString(
  <HTML url={path} root="https://example.com/">
    <Router routes={ROUTES}/>
  </HTML>
);
```

### Base paths

`root="https://example.com/app/"` is supported — the base path prefix is stripped from the URL before matching, and URLs that fall outside the base render as `null`.

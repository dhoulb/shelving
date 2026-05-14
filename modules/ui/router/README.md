# Router

Client-side routing for shelving apps.

Two pieces:

| Component       | Job                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `<Navigation>`  | One per app. Owns URL state, intercepts link clicks, listens for `popstate`.                  |
| `<Router>`      | Pure matcher. Reads URL from `<Meta>`, matches `routes`, renders the matched element.         |

Plus `requireNavigation()` for imperative `forward()` / `redirect()` calls from anywhere in the tree.

`<Router>` reads URL state from `<Meta>`, so it works with no `<Navigation>` at all (SSR, static rendering, tests). `<Navigation>` is what publishes a *live* URL into `<Meta>` on the client.

## Basic setup

```tsx
<HTML url={initialUrl} base="https://example.com/">
  <Navigation>
    <Router routes={{
      "/": HomePage,
      "/users/{id}": UserPage,
      "/about": AboutPage,
    }}/>
  </Navigation>
</HTML>
```

- Route keys are `AbsolutePath` strings starting with `/`.
- Placeholders (`{id}`, `:id`, `[id]`, `${id}`, `{{id}}`) are passed to function/component routes as props (merged with URL `?query` params; placeholders win on conflict).
- A string value (e.g. `"/users/123"`) is a redirect — visiting the key path navigates to the target.
- `<Router>` itself accepts `PossibleMeta` props (`url`, `base`, etc.) to override the surrounding context.

## Route value types

| Value                 | Behaviour                                                              |
| --------------------- | ---------------------------------------------------------------------- |
| `RouteComponent`      | Rendered as `<Component {...params}/>` with merged placeholder + query. |
| `AbsolutePath` string | Redirects to that path (placeholders resolved against the source).      |
| `ReactElement`        | Rendered as-is — use for layout wrapping or composing inner routers.    |

## Placeholder syntax

All forms produce the same matched value — pick whichever reads best:

| Form              | Single segment         | Catchall (one+ segments, also matches empty) |
| ----------------- | ---------------------- | -------------------------------------------- |
| Anonymous         | `*` (named `"0"`)      | `**` / `***` / `****` (named `"0"`)          |
| Colon             | `:name`                | `:name*` / `:name**`                         |
| Single brace      | `{name}`               | `{...name}` / `{name*}` / `{....name}`       |
| Square bracket    | `[name]`               | `[...name]` / `[name*]`                      |
| Dollar brace      | `${name}`              | `${...name}` / `${name*}`                    |
| Double brace      | `{{name}}`             | `{{...name}}` / `{{name*}}`                  |

Modifier chars are tolerant: one-or-more stars and three-or-more dots are all equivalent. So `{path*}`, `{path**}`, `{...path}`, and `{....path}` all behave the same.

Catchall placeholders allow empty values, so a trailing catchall matches the trailing-slash-absent variant too — `/files/{...path}` matches both `/files`, `/files/`, and `/files/a/b/c`.

## Layout wrapping

Put layout JSX as the route value with another `<Router>` inside.

```tsx
const SIDEBARRED_ROUTES = {
  "/users": <UsersPage/>,
  "/users/{id}": <UserPage/>,
  "/settings": <SettingsPage/>,
};

<Router routes={{
  "/": <HomePage/>,
  "/{...path}": (
    <SidebarLayout>
      <Router routes={SIDEBARRED_ROUTES}/>
    </SidebarLayout>
  ),
}}/>
```

The outer router matches everything, wraps in `<SidebarLayout>`, and hands off to the inner router. Since `<Router>` reads its URL from `<Meta>`, the inner router sees the same URL.

## Section / microsite pattern

A self-contained "section" of the app — its own URL prefix, its own routes — composes via a catchall + a function route value that hands the captured sub-path to a nested router.

```tsx
<Router routes={{
  "/": <HomePage/>,
  "/users/{...path}": ({ path = "/" }) => (
    <Router routes={{
      "/": UsersPage,
      "/{id}": UserPage,
    }} url={path}/>
  ),
}}/>
```

The outer router captures everything under `/users` into the `path` placeholder, then the inner router treats `path` as its starting URL. The inner router's `"/"` matches the bare `/users`; `/{id}` matches `/users/123`.

Pull that out into a dedicated component for readability:

```tsx
const USER_ROUTES = {
  "/": UsersPage,
  "/{id}": UserPage,
  "/{id}/edit": UserEditPage,
};

export function UserRouter({ path = "/" }: { path?: AbsolutePath }) {
  return <Router routes={USER_ROUTES} url={path}/>;
}

// then at the call site:
<Router routes={{
  "/": <HomePage/>,
  "/users/{...path}": ({ path }) => <UserRouter path={path}/>,
  "/blog/{...path}":  ({ path }) => <BlogRouter path={path}/>,
}}/>
```

Each section module owns its routes and exposes one component. The top-level router stays a flat list of section prefixes.

## Stacking layouts and sections

The two patterns compose. Wrap a bunch of routes in a layout, then route further inside it:

```tsx
const SIDEBARRED_ROUTES = {
  "/": <Dashboard/>,
  "/users/{...path}":   ({ path }) => <UserRouter path={path}/>,
  "/blog/{...path}":    ({ path }) => <BlogRouter path={path}/>,
  "/settings": <SettingsPage/>,
};

<Router routes={{
  "/login": <LoginPage/>,                       // no sidebar
  "/{...path}": (                                // everything else wrapped
    <SidebarLayout>
      <Router routes={SIDEBARRED_ROUTES}/>
    </SidebarLayout>
  ),
}}/>
```

`/login` skips the sidebar. Every other path goes through `<SidebarLayout>` and then the inner router decides what to render — including handing off to section routers via the catchall pattern.

## Navigation

Inside a component, get the navigation store for imperative URL changes:

```tsx
const nav = requireNavigation();
nav.forward("/users/123");   // push history
nav.redirect("/login");       // replace history
```

Same-origin anchor clicks are intercepted automatically and turned into `forward()` calls. Add a `download` attribute to opt out.

## `<NavigationIsolate>`

Force a full remount of children whenever the URL changes:

```tsx
<NavigationIsolate>
  <ExpensiveStatefulThing/>
</NavigationIsolate>
```

## SSR / static rendering

`<Router>` has no client requirements — it reads from `<Meta>` and re-renders when context changes. For static rendering, set `url` and `base` on the outer wrapper and skip `<Navigation>`:

```tsx
renderToString(
  <HTML url={path} base="https://example.com/">
    <Router routes={…}/>
  </HTML>
);
```

For client-side SPAs, wrap the same tree in `<Navigation>` for live URL updates.

## Base paths

`base="https://example.com/app/"` is supported. The base path prefix is stripped from the URL before route matching via `matchURLPrefix`. URLs that fall outside the base render as `null` from the router.

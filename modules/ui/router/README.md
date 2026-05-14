# Router

Client-side routing primitives for shelving apps.

Three pieces:

| Component        | Job                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `<Navigation>`   | One per app. Owns URL state, intercepts link clicks, listens for `popstate`.              |
| `<Router>`       | Pure matcher. Reads URL from `<Meta>`, matches `routes`, renders the matched element.     |
| `requireNavigation()` | Imperative access to the navigation store for `forward()` / `redirect()` calls. |

`<Router>` reads URL state from `<Meta>`, so it works without `<Navigation>` (useful for SSR / static rendering / tests). `<Navigation>` is what publishes a *live* URL into `<Meta>` on the client.

## Basic setup

```tsx
<Meta url={initialUrl} base="https://example.com/">
  <Navigation>
    <Router routes={{
      "/": HomePage,
      "/users/{id}": UserPage,
      "/about": AboutPage,
    }}/>
  </Navigation>
</Meta>
```

- Route keys are absolute paths starting with `/`.
- `{named}` placeholders are passed to the route as props (merged with `?query` params).
- A string value (e.g. `"/users/123"`) triggers a redirect when matched.
- `**` at the end of a path captures any remaining segments under the prop key `"0"`.

## Route value types

| Value                 | Behaviour                                                       |
| --------------------- | --------------------------------------------------------------- |
| `RouteComponent`      | Rendered as `<Component {...props}/>` with placeholder/query props. |
| `AbsolutePath` string | Redirects to that path.                                         |
| `ReactElement`        | Rendered as-is — use for layout wrapping with a nested `<Router>`. |

## Layout wrapping (nested routers)

Put a layout JSX as the route value with another `<Router>` inside. Use `<Meta base="…">` to scope the inner router to the consumed prefix.

```tsx
<Router routes={{
  "/": <Home/>,
  "/videos/**": (
    <Meta base="/videos">
      <SidebarLayout>
        <Router routes={{
          "/": <VideoList/>,
          "/{id}": <VideoPlayer/>,
        }}/>
      </SidebarLayout>
    </Meta>
  ),
}}/>
```

The `<Meta base="/videos">` is what tells the inner `<Router>` to match against the path *after* `/videos`. This is explicit on purpose — no hidden scope context.

## Microsite / section pattern

A section can be a self-contained module exporting its own router. Wrap it in `<Meta>` at the call site to mount it under a prefix.

```tsx
// videos/VideoRouter.tsx
export function VideoRouter() {
  return (
    <SidebarLayout>
      <Router routes={{
        "/": <VideoList/>,
        "/{id}": <VideoPlayer/>,
        "/admin/**": (
          <Meta base="/admin">
            <Router routes={{ "/queue": <Queue/> }}/>
          </Meta>
        ),
      }}/>
    </SidebarLayout>
  );
}

// site router
<Router routes={{
  "/": <Home/>,
  "/videos/**": <Meta base="/videos"><VideoRouter/></Meta>,
  "/blog/**":   <Meta base="/blog"><BlogRouter/></Meta>,
}}/>
```

## Navigation

For imperative URL changes from inside a component:

```tsx
const nav = requireNavigation();
nav.forward("/users/123");   // push
nav.redirect("/login");       // replace
```

Same-origin anchor clicks are intercepted automatically and turned into `forward()` calls. Add a `download` attribute to an anchor to opt out.

## `<NavigationIsolate>`

Force a full remount of children whenever the URL changes:

```tsx
<NavigationIsolate>
  <StatefulThing />
</NavigationIsolate>
```

## SSR / static rendering

`<Router>` reads URL from `<Meta>` and has no client requirements. For static rendering, set `url` and `base` on `<Meta>` and skip `<Navigation>`:

```tsx
renderToString(
  <Meta url={path} base="https://example.com/">
    <HTML>
      <Router routes={…}/>
    </HTML>
  </Meta>
);
```

For client-side SPAs, wrap the same tree in `<Navigation>` to get live URL updates.

## Base paths

`<Meta base="https://example.com/app/">` is supported. The base path prefix is stripped from the URL before route matching via `matchURLPrefix`. URLs that fall outside the base render as `null` from the router.

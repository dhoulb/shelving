# Navigation

The top-level navigation provider for a client-side app. It owns a single `NavigationStore`, publishes the live URL into the `<Meta>` context so descendant `<Router>`s re-render on navigation, and wires up browser history. Use exactly one `<Navigation>` per app — nested routers all share its single store.

**Things to know:**

- Same-origin anchor clicks are intercepted automatically and turned into `forward()` calls. Add a `download` attribute to an anchor to opt out.
- It listens for `popstate` so the store stays in sync with browser back/forward.
- It initialises the store from the surrounding `<Meta>` url/base, so set those on an ancestor `<App>` / `<HTML>` / `<Page>`. In the browser the store falls back to `window.location.href` when no url is set.
- The meta it publishes always has a `root` — when none is set anywhere, `root` defaults to the live URL's origin. Setting `root` explicitly on `<App>` / `<HTML>` is still strongly recommended, especially for apps served under a sub-path.
- `<Router>` works with no `<Navigation>` at all (SSR, static rendering, tests) — `<Navigation>` is only what makes the URL *live* on the client.

## Usage

```tsx
import { HTML, Navigation, Router } from "shelving/ui";

<HTML url={initialUrl} root="https://example.com/">
  <Navigation>
    <Router routes={ROUTES}/>
  </Navigation>
</HTML>
```

### Imperative navigation

Read the navigation store from anywhere in the tree with `requireNavigation()` for imperative URL changes:

```tsx
import { requireNavigation } from "shelving/ui";

const nav = requireNavigation();
nav.forward("/users/123");   // push a new history entry
nav.redirect("/login");      // replace the current history entry
```

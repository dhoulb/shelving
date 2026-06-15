# Navigation

The top-level navigation provider for a client-side app. It owns a single [`NavigationStore`](/ui/NavigationStore), publishes the live URL into the `<Meta>` context so descendant [`Router`](/ui/Router)s re-render on navigation, and wires up browser history. Use exactly one `<Navigation>` per app — nested routers all share its single store.

**Things to know:**

- Same-origin anchor clicks are intercepted automatically and turned into `forward()` calls. Add a `download` attribute to an anchor to opt out.
- It listens for `popstate` so the store stays in sync with browser back/forward.
- It initialises the store from the surrounding `<Meta>` url/base, so set those on an ancestor [`HTML`](/ui/HTML) / [`Page`](/ui/Page).
- [`Router`](/ui/Router) works with no `<Navigation>` at all (SSR, static rendering, tests) — `<Navigation>` is only what makes the URL *live* on the client.

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

## See also

- [`Router`](/ui/Router) — matches the URL `<Navigation>` publishes and renders the page
- [`NavigationStore`](/ui/NavigationStore) — the store `<Navigation>` owns and `requireNavigation()` returns
- [`HTML`](/ui/HTML) / [`Page`](/ui/Page) — supply the initial url/base meta
- [`HorizontalTransition`](/ui/HorizontalTransition) — animate the route changes `<Navigation>` triggers

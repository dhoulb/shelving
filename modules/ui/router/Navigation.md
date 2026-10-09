# Navigation

The top-level navigation provider for a client-side app. It owns a single `NavigationStore`, publishes the live URL into the `<Meta>` context so descendant `<Router>`s re-render on navigation, and wires up browser history. Use exactly one `<Navigation>` per app — nested routers all share its single store.

**Things to know:**

- Same-origin anchor clicks are intercepted automatically and turned into `forward()` calls. Add a `download` attribute to an anchor to opt out.
- An anchor with a `data-back` attribute calls `back()` instead, so the page slides back. Set it with the `back` prop on `<Button>` or `<Link>`, e.g. on a "Back to profile" button.
- It listens for `popstate` so the store stays in sync with browser back/forward.
- It publishes each page change inside `startTransition()`, so a `<Transition>` around the routes animates it. A link click, `NavigationStore.forward()` or `NavigationStore.redirect()` sets the `"forward"` transition type. A `data-back` link click, `NavigationStore.back()`, and the browser back or forward button set `"back"` (`popstate` does not say which way it went).
- When the browser already animated the change, for example a swipe-back gesture on a phone, there is no view transition, so the page does not slide twice. The browser says so with `hasUAVisualTransition` on the `popstate` event. Other browsers still slide.
- The `popstate` update waits for the next task (`setTimeout()`). React renders a transition that starts inside `popstate` as a sync update with no view transition.
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

### Page transitions

```tsx
import { HorizontalTransition, Navigation, Router } from "shelving/ui";

// Links slide right. Back links and the browser back button slide left.
<Navigation>
  <HorizontalTransition>
    <Router routes={ROUTES}/>
  </HorizontalTransition>
</Navigation>

// A "back to" link slides left too.
<Button href="/profile" back>Back to profile</Button>
```

### Imperative navigation

Read the navigation store from anywhere in the tree with `requireNavigation()` for imperative URL changes:

```tsx
import { requireNavigation } from "shelving/ui";

const nav = requireNavigation();
nav.forward("/users/123");   // push a new history entry
nav.redirect("/login");      // replace the current history entry
nav.back("/users");          // push a new history entry that slides back
```

# Navigation

The top-level navigation provider for a client-side app. It owns one `NavigationStore`, turns link clicks into navigation, and publishes the live URL into `<Meta>`, so each `<Router>` re-renders when the URL changes. Use exactly one `<Navigation>` per app. Nested routers all share its store.

Give it `stacks` for an app with a tab bar. Each stack is one tab with its own history of pages, like a phone app: each tab remembers where you left it, and a back button goes back within its tab.

**Things to know:**

- Same-origin link clicks become `NavigationStore.forward()`, so the page slides forward.
- A link with `className="back"` calls `NavigationStore.back()`, so the page slides back. `<BackButton>` sets this class for you.
- A link with `className="replace"` calls `NavigationStore.replace()`. It changes the URL with no new history entry and no slide, and keeps the same page mounted. Use it for tabs inside a page.
- Clicks with a modifier key (Cmd, Ctrl, Shift, Alt), a middle-click, and links with `download` or a `target` other than `_self` go to the browser as usual.
- It publishes each page change inside `startTransition()` with a `"forward"` or `"back"` transition type, so a `<Transition>` such as `<HorizontalTransition>` slides the page. A replace has no transition.
- The browser back and forward buttons slide too. Inside a stack the direction comes from the depth of the page. Across stacks it comes from tab order.
- When the browser already animated the change (for example a swipe-back on a phone), there is no view transition, so the page does not slide twice.
- It publishes `stack` (the root of the current stack) into `<Meta>` beside `url`, so any component can read the current tab with `requireMeta().stack`.
- It reads the start URL and root from the surrounding `<Meta>`, so set `url` and `root` on an ancestor `<App>` or `<HTML>`. In the browser the URL falls back to `window.location.href`.
- `<Router>` works with no `<Navigation>` (server renders, static renders, tests). `<Navigation>` only makes the URL live on the client.

### Browser support

Stacks and slides use the browser [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API). Without it (older browsers, a server render, or a sandboxed frame), `<Navigation>` falls back to plain navigation:

- Links still go through the app with no page reload, and the browser back button works.
- There are no stacks, no slides and no `<RouteCache>`. Each page mounts fresh.
- `<StackButton>` is a plain link to its stack's root. `<BackButton>` is a plain link to its `href`.

## Usage

### Basic setup

```tsx
import { App, Navigation, Router } from "shelving/ui";

<App root="https://example.com/">
  <Navigation>
    <Router routes={ROUTES}/>
  </Navigation>
</App>
```

### App with a tab bar

List the root path of each stack in tab order. Put a `<StackButton>` for each stack in the tab bar.

```tsx
import { App, HorizontalTransition, Navigation, RouteCache, Router, StackButton } from "shelving/ui";

const STACKS = ["/home", "/discover", "/profile"] as const;

<App root="https://example.com/">
  <Navigation stacks={STACKS}>
    <HorizontalTransition>
      <RouteCache>
        <Router routes={ROUTES}/>
      </RouteCache>
    </HorizontalTransition>
    <nav className="tab-bar">
      <StackButton stack="/home">Home</StackButton>
      <StackButton stack="/discover">Discover</StackButton>
      <StackButton stack="/profile">Profile</StackButton>
    </nav>
  </Navigation>
</App>
```

Put the transition **outside** `<RouteCache>`, around the whole cache. Safari (iOS 18) loses the exit animation when each page has its own `<ViewTransition>`.

Each link pushes a new page onto the current stack, wherever it points. So a link from `/home` to `/profile/settings` opens the settings page in the Home tab, and the Profile tab stays where it was. Tap a `<StackButton>` to change tab.

### Links

```tsx
// Opens a new page in the current stack. Slides forward.
<Button href="/home/post/1">Open post</Button>

// Goes back to a page. Slides back.
// If the page is already in the stack, the stack goes back to it.
<Button href="/home" className="back">Back to home</Button>

// The back button for a page header. Goes to the page before this one in the stack, or to `href`.
<BackButton href="/home"/>

// Changes the URL but keeps the same page. No slide, no new history entry.
<Button href="/profile/posts" className="replace">Posts</Button>
<Button href="/profile/likes" className="replace">Likes</Button>
```

### Imperative navigation

Read the store from anywhere in the tree with `requireNavigation()`:

```tsx
import { requireNavigation } from "shelving/ui";

const nav = requireNavigation();
nav.forward("/home/post/1");  // Open a page in the current stack.
nav.back("/home");            // Go back to a page.
nav.replace("/login");        // Change the URL of the current page.
```

See `NavigationStore` for what each method does.

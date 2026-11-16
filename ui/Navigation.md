# Navigation

- Kind: component
- Import: `import { Navigation } from "shelving/ui";`

Top-level navigation provider, with one stack of pages for each tab.
- Owns a single `NavigationStore` made from the surrounding `<Meta>` url and root.
- Turns clicks on same-origin links into `NavigationStore.forward()`, or `NavigationStore.back()` for a link with `className="back"`, or `NavigationStore.replace()` for a link with `className="replace"`. Clicks with a modifier key, or on links with `download` or a `target`, are left to the browser.
- Publishes the URL and the current `stack` into `Meta`, and the position in the stacks into `NavigationPositionContext`, all in one render.
- Publishes each change inside `startTransition()` with a `"forward"` or `"back"` transition type, so a `<Transition>` around the routes runs a view transition. A replace, or a change the browser already animated (for example a swipe-back), has no transition.
- Uses the browser Navigation API. Without it (older browsers, server renders) there are no stacks and no transitions.

Exactly one `<Navigation>` per app. Nested routers share its store.

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
- It publishes `stack` (the root of the current stack) into `<Meta>` beside `url`, so any component can read the current tab with `requireMeta().stack`. With no `stacks`, the app has one stack, and `stack` is `"/"`.
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

To select a tab when the app starts, pass the starting `stack`. The app decides which stack the opening URL belongs to, for example:

```tsx
const path = window.location.pathname;
const stack = STACKS.find(s => path === s || path.startsWith(`${s}/`));

<Navigation stacks={STACKS} stack={stack}>
```

Put the transition **outside** `<RouteCache>`, around the whole cache. Safari (iOS 18) loses the exit animation when each page has its own `<ViewTransition>`.

The app opens in the `stack` you set on `<Navigation>` (or on the surrounding `<Meta>`, like `url` and `root`), else in the `/` stack. A page in the `/` stack, such as a deep link or a login page, is **unstacked**: no tab is selected, and links from it stay unstacked until you tap a tab or name a stack (for example `nav.replace("/home", "/home")` after a login). See `NavigationStore`.

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


## Signatures

```ts
Navigation({ children, stacks = [], ...meta }: NavigationProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta` | `NavigationProps` |  |
| `.stacks` | `readonly AbsolutePath[] \| undefined` | Root path of each stack, in tab order, for an app with a tab bar (for example `["/home", "/discover", "/profile"]`). - Each stack keeps its own pages, so each tab remembers where you left it, and a back button goes back within its tab. - With no stacks, the app has one stack at `"/"`, and `stack` in `Meta` is `"/"`. Read only. Optional. |
| `.stack` | `AbsolutePath \| undefined` | Stack of the page the app opens at (for example `"/home"`), like `url` and `root`. - Read from this prop, else from the surrounding `<Meta>`, else `"/"`. - Used only when the opening history entry has no saved stack. A reload keeps the stack it had. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

# Navigation

The top-level navigation provider for a client-side app. It owns one `NavigationSequence`, turns link clicks into navigation, holds the page it shows in its own state, and publishes that page into `<Meta>`, so each `<Router>` re-renders when the page changes. Use exactly one `<Navigation>` per app. Nested routers all share its sequence.

Give it `stacks` for an app with a tab bar. Each stack is one tab with its own history of pages, like a phone app: each tab remembers where you left it, and a back button goes back within its tab.

**Things to know:**

- Same-origin link clicks become `NavigationSequence.forward()`, so the page slides forward.
- A link with `className="back"` calls `NavigationSequence.back()`, so the page slides back. `<BackButton>` sets this class for you.
- A link with `className="replace"` calls `NavigationSequence.replace()`. It changes the URL with no new history entry and no slide, and keeps the same page mounted. Use it for tabs inside a page.
- Clicks with a modifier key (Cmd, Ctrl, Shift, Alt), a middle-click, and links with `download` or a `target` other than `_self` go to the browser as usual.
- It takes each `NavigationEvent` with `useSequenceTransition()`. A move is set inside `startTransition()` with its `"forward"` or `"back"` transition type, so a `<Transition>` such as `<HorizontalTransition>` slides the page. A replace has no transition. An event for the page already shown is skipped.
- The browser back and forward buttons slide too. Inside a stack the direction comes from the ordinal of the page. Across stacks it comes from tab order.
- When the browser already animated the change (for example a swipe-back on a phone), there is no view transition, so the page does not slide twice.
- It publishes `url`, `stack` (the root of the current stack) and `ordinal` (the page's place in its stack) into `<Meta>`, so any component can read the page on screen with `requireMeta()`. On a floating page (outside every stack) `stack` is `null`. With no `stacks`, every page floats.
- When it starts listening it reads the current history entry, so a `replace()` sent before that (for example from a page's first effect) is not lost.
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
		<Router routes={ROUTES} />
	</Navigation>
</App>;
```

### App with a tab bar

List the root path of each stack in tab order. Put a `<StackButton>` for each stack in the tab bar.

```tsx
import { App, AppLayout, HorizontalTransition, Navigation, PageLoader, RouteCache, Router, Scroll, StackButton } from "shelving/ui";

const STACKS = ["/home", "/discover", "/profile"] as const;

const TABS = (
	<>
		<StackButton stack="/home">Home</StackButton>
		<StackButton stack="/discover">Discover</StackButton>
		<StackButton stack="/profile">Profile</StackButton>
	</>
);

<App root="https://example.com/">
	<Navigation stacks={STACKS}>
		<AppLayout nav={TABS}>
			<HorizontalTransition default="none">
				<RouteCache>
					<Scroll vertical cover>
						<PageLoader>
							<Router routes={ROUTES} />
						</PageLoader>
					</Scroll>
				</RouteCache>
			</HorizontalTransition>
		</AppLayout>
	</Navigation>
</App>;
```

The tab bar is in the layout, outside the cache, so it stays still while pages slide. See "Composing an app" on `<App>` for the full nesting rules.

To select a tab when the app starts, pass the starting `stack`. The app decides which stack the opening URL belongs to, for example:

```tsx
const path = window.location.pathname;
const stack = STACKS.find(s => path === s || path.startsWith(`${s}/`));

<Navigation stacks={STACKS} stack={stack}>
```

Put the transition **outside** `<RouteCache>`, around the whole cache, with no `key`. A page change is an update of the transition, and it slides by type. Set `default="none"`, so a change with no type (a replace) does not animate. Safari (iOS 18) loses the exit animation when each page has its own `<ViewTransition>`. The app also works with no `<RouteCache>`: put the transition around the `<Router>`.

The app opens in the `stack` you set on `<Navigation>` (or on the surrounding `<Meta>`, like `url` and `root`), else the page **floats**: its stack is `null`. A floating page, such as a deep link or a login page, is outside every tab: no tab is selected, and links from it stay floating until you tap a tab or name a stack (for example `nav.replace("/home", "/home")` after a login). `/` is a normal stack root, so a Home tab at `/` is never mixed up with floating pages. See `NavigationSequence`.

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

Read the sequence from anywhere in the tree with `requireNavigation()`:

```tsx
import { requireNavigation } from "shelving/ui";

const nav = requireNavigation();
nav.forward("/home/post/1"); // Open a page in the current stack.
nav.back("/home"); // Go back to a page.
nav.replace("/login"); // Change the URL of the current page.
```

See `NavigationSequence` for what each method does.

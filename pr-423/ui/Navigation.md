# Navigation

- Kind: component
- Import: `import { Navigation } from "shelving/ui";`

Top-level navigation provider, with one stack of pages for each tab.
- Owns a single `NavigationSequence` made from the surrounding `<Meta>` url and root.
- Turns clicks on same-origin links into `NavigationSequence.forward()`, or `NavigationSequence.back()` for a link with `className="back"`, or `NavigationSequence.replace()` for a link with `className="replace"`. Clicks with a modifier key, or on links with `download` or a `target`, are left to the browser.
- Holds the page it shows in its own state, and publishes its `url`, `stack` and `ordinal` into `Meta`. Read the current page from `Meta`.
- Takes each `NavigationEvent` with `useSequenceTransition()`. A move is set inside `startTransition()` with its `"forward"` or `"back"` type, so a `<Transition>` around the routes runs a view transition. A replace has no transition. An event for the page already shown is skipped.
- Uses the browser Navigation API. Without it (older browsers, server renders) there are no stacks and no transitions.

Exactly one `<Navigation>` per app. Nested routers share its sequence.

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


## Signatures

```ts
Navigation({ children, stacks = [], ...meta }: NavigationProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta` | `NavigationProps` |  |
| `.stacks` | `readonly AbsolutePath[] \| undefined` | Root path of each stack, in tab order, for an app with a tab bar (for example `["/home", "/discover", "/profile"]`). - Each stack keeps its own pages, so each tab remembers where you left it, and a back button goes back within its tab. - A page outside these stacks is floating: its stack is `null`, and no tab is selected. - With no stacks, every page floats. Read only. Optional. |
| `.stack` | `AbsolutePath \| null \| undefined` | Stack of the page the app opens at (for example `"/home"`), like `url` and `root`. - Read from this prop, else from the surrounding `<Meta>`, else `null` (floating). - Used only when the opening history entry has no saved stack. A reload keeps the stack it had. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

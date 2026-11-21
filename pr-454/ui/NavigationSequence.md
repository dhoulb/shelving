# NavigationSequence

- Kind: class
- Import: `import { NavigationSequence } from "shelving/ui";`
- Extends: `DeferredSequence<NavigationEvent>`

Sequence of navigation events that drives browser history and keeps a stack of pages for each tab.

- It is not a store: it holds no "current page" for the UI. Each change of page (a move, a replace, or the browser back and forward buttons) publishes one `NavigationEvent`, and `<Navigation>` keeps the page it shows in its own state.
- `url`, `stack` and `ordinal` say where the browser history is now. The page on screen can differ for a moment, for example during a swipe-back preview. To read the page on screen, read `Meta`.
- `publish()` sends an event by hand, for example to show the page below during a swipe-back.
- With the browser Navigation API, each history entry saves a `NavigationEntryState`, and each stack is read from `navigation.entries()` when it is needed. Nothing else is kept.
- A page outside the listed stacks is floating: its stack is `null`. The floating stack has no root page and no tab.
- In a listed stack, ordinal `0` is always the stack's root path.
- Without the Navigation API (older browsers and server renders) there are no stacks: `stack` stays the starting stack, `history()` is empty, and `stack` arguments are ignored.
- Owned by `<Navigation>`. Read it with `requireNavigation()`.

The sequence of navigation events that drives browser history and keeps one stack of pages for each tab. It is not a store: it holds no "current page" for the UI. Each change of page publishes one `NavigationEvent`, and `<Navigation>` keeps the page it shows in its own state. `<Navigation>` owns it. Read it with `requireNavigation()`, and do not make your own.

**Things to know:**

- Each change of page (a link, a back button, a replace, or the browser back and forward buttons) publishes one `NavigationEvent`: `{ url, stack, ordinal, direction }`.
- A move has a `direction` (`"forward"` or `"back"`), so `<Navigation>` shows it in a view transition of that type. A replace has no `direction`, so it shows at once.
- To read the page on screen, read `Meta` (`requireMeta()` or `requireMetaURL()`), not the sequence. The two can differ for a moment, for example during a swipe-back.
- `NavigationSequence.url`, `NavigationSequence.stack` and `NavigationSequence.path` say where the browser history is now. `NavigationSequence.current()` returns the same as an event with no direction.
- `NavigationSequence.stacks` is the root path of each stack, in tab order, from the `stacks` prop on `<Navigation>`. `/` is a normal stack root, like any other path.
- A page that is not in a listed stack is **floating**: its stack is `null`. See [Floating pages](#floating-pages).
- In a listed stack, ordinal `0` is always the stack's root path. A deeper page always has the root below it.
- `NavigationSequence.history()` returns the pages in the current stack (or a given stack), root first.
- `NavigationSequence.publish()` sends an event by hand, for example to show the page below during a swipe-back. It returns a promise that resolves when `<Navigation>` has committed the event.
- Events sent in the same microtask merge: only the last one is shown.
- All URLs resolve against the sequence's `base`. Each method also takes a full same-origin URL.
- Without the browser Navigation API there is no stack history: `stack` stays the starting stack, `history()` returns `[]`, `ordinal` is `undefined`, and every `stack` argument is ignored. `forward()` and `back()` push a history entry, and `replace()` replaces it.

## Methods

| Method                  | What it does                                                                                                                                                                                                                                                                                                                | Slide                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `forward(href, stack?)` | Opens `href` as a new page on top of the stack. If `href` is the top page of another stack, it switches to that stack (a tab switch). If `href` is the current URL, it is a replace.                                                                                                                                        | Forward. Across stacks, by tab order. |
| `back(href, stack?)`    | Goes back to `href`. If `href` is in the stack, the stack goes back to it, and the pages above it leave the stack. If `href` is the root of the stack, the stack goes to its root. Otherwise `href` takes the place of the top page of the stack. If the browser refuses the Navigation API back, it uses `history.back()`. | Back                                  |
| `replace(href, stack?)` | Changes the URL of the current page. The stack, the ordinal and the mounted page stay the same. No new history entry. With another `stack`, the page moves into that stack: at its root if `href` is the root, else on top of its pages.                                                                                    | None                                  |
| `history(stack?)`       | Returns the pages in `stack`, root first.                                                                                                                                                                                                                                                                                   | —                                     |
| `current()`             | Returns where the browser history is now, as an event with no direction.                                                                                                                                                                                                                                                    | —                                     |
| `publish(event)`        | Sends an event by hand. Resolves when `<Navigation>` has committed it.                                                                                                                                                                                                                                                      | The event's `direction`               |

`stack` defaults to the current stack. Pass `null` to name the floating stack.

## Floating pages

A page changes stack only when you say so: with a `<StackButton>`, or with a `stack` argument to `forward()`, `back()` or `replace()`. Links never change stack. The page the app opens at starts in the `stack` set on `<Navigation>` (or the surrounding `<Meta>`), else it **floats**: its stack is `null`. For example: a deep link into the app, a fresh open of `/post/9`, or a login page.

- The floating stack is outside every tab. It has no root page and no `<StackButton>`, so no stack button is selected on a floating page.
- Links from a floating page push deeper in the floating stack, even a link to a stack root.
- To leave the floating stack, tap a `<StackButton>`, or name the stack. To move a page back into it, pass `null` as the `stack`.
- `<RouteCache>` gives floating pages no protection: they are dropped like any other page past `maxCached`.
- With no `stacks`, every page floats.

## Opening the app

- To select a tab when the app starts, set `stack` on `<Navigation>`. The app decides which stack the opening URL belongs to. After a reload, each history entry keeps the stack it had.
- A deep page the app opens at, in a listed stack, starts at ordinal 1, so the stack root is its parent. A `<StackButton>` or a back gesture then goes to the root. A stack root starts at ordinal 0.
- A `stack` that is not in `stacks` is ignored: the page floats.

For example, a login page sends the user home after they log in, and names the Home stack:

```tsx
const nav = requireNavigation();
nav.replace("/home", "/home");
```

## How stacks work

The sequence saves a small state on each browser history entry: the `stack` the page is in, and its `ordinal` in that stack (`0` is the root). See `NavigationEntryState`. To read a stack, the sequence walks back through the browser history from the current entry. It takes the newest entry in that stack, then the newest earlier entry with a lower ordinal, and so on down to ordinal `0`.

Why ordinal? A browser history entry cannot be changed or removed. So when you go back in one stack while another stack's pages are after it in the history, the sequence cannot go back in the browser. It pushes a new entry for the page you went back to, at that page's ordinal. The pages that were above it now have a higher ordinal than the newest entry, so they are no longer in the stack.

For example, with tabs `/home` and `/profile`:

| Step                | New history entry          | Home stack              | Profile stack |
| ------------------- | -------------------------- | ----------------------- | ------------- |
| Start at `/home`    | `/home` (ordinal 0)        | `/home`                 | —             |
| Open a post         | `/home/post/1` (ordinal 1) | `/home`, `/home/post/1` | —             |
| Tap the Profile tab | `/profile` (ordinal 0)     | `/home`, `/home/post/1` | `/profile`    |
| Tap the Home tab    | `/home/post/1` (ordinal 1) | `/home`, `/home/post/1` | `/profile`    |
| Tap the back button | `/home` (ordinal 0)        | `/home`                 | `/profile`    |

When the page you go back to is the entry just before the current one, `back()` goes back in the browser history and pushes nothing.

The browser back and forward buttons walk the history entries one at a time, as usual. Each entry knows its stack and ordinal, so the stacks are always right and the slide goes the right way.

## Usage

```tsx
import { Button, requireNavigation } from "shelving/ui";

function LogoutButton() {
	const nav = requireNavigation();
	return <Button onClick={() => nav.replace("/login")}>Log out</Button>;
}
```

Read the current stack in a component from `Meta`:

```tsx
import { requireMeta } from "shelving/ui";

function TabTitle() {
	const { stack } = requireMeta();
	return <h1>{stack === "/profile" ? "Profile" : "Home"}</h1>;
}
```

Show the page below during a swipe-back. React runs the back transition, and the swipe scrubs it:

```tsx
const nav = requireNavigation();
const { stack = null, ordinal } = requireMetaURL();
const parent = ordinal ? nav.history(stack)[ordinal - 1] : undefined;
if (parent) {
	// Start the swipe: show the page below with the back transition.
	await nav.publish({ url: requireURL(parent, nav.base), stack, ordinal: ordinal - 1, direction: "back" });
	// Release: go back for real. It publishes the same page, so it is skipped.
	nav.back(parent);
	// Or cancel: show the old page again, with no transition.
	// await nav.publish({ ...from, direction: undefined });
}
```

List the pages in a stack (for example, for breadcrumbs):

```tsx
const nav = requireNavigation();
nav.history("/home"); // ["/home", "/home/post/1", "/home/post/1/comments"]
```

Make a sequence by hand only in tests:

```tsx
import { NavigationSequence } from "shelving/ui";

// URL, root, starting stack, then the stacks in tab order.
const nav = new NavigationSequence("https://example.com/home", "https://example.com/", "/home", "/home", "/profile");
nav.forward("/home/post/1");
```


## Signatures

```ts
new NavigationSequence(url: PossibleURL = typeof window === "undefined" ? "/" : window.location.href, base?: PossibleURL, stack: AbsolutePath | null = null, ...stacks: AbsolutePath[])
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `url` | `PossibleURL` | Defaults to `typeof window === "undefined" ? "/" : window.location.href`. |
| `base` | `PossibleURL` | Optional. |
| `stack` | `AbsolutePath \| null` | Defaults to `null`. |
| `stacks` | `AbsolutePath[]` |  |

## Returns

| Type | Description |
| --- | --- |
| `NavigationSequence` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `stacks` | `readonly AbsolutePath[]` | Root path of each stack, in tab order. With none, every page floats. Read only. |
| `base` | `ImmutableURL \| undefined` | Base URL of the app, used to resolve relative URLs and to work out paths. Read only. |
| `url` | `ImmutableURL` | URL the browser history is on now. Read only. |
| `stack` | `AbsolutePath \| null` | Root path of the stack the browser history is on now, or `null` for a floating page. Read only. |
| `path` | `AbsolutePath \| undefined` | Path of the current URL relative to the app root (without its `?query`), or `undefined` if the URL is outside the app. Read only. |

## Methods

- [NavigationSequence.current()](NavigationSequence/current.md): Where the browser history is now, as an event with no direction.
- [NavigationSequence.publish()](NavigationSequence/publish.md): Publish an event by hand, without changing history.
- [NavigationSequence.committed()](NavigationSequence/committed.md): Tell waiting publish() calls that <Navigation> has committed a page.
- [NavigationSequence.listen()](NavigationSequence/listen.md): Start listening to the browser (back, forward and swipe).
- [NavigationSequence.history()](NavigationSequence/history.md): Get the pages in a stack, root first, or every page in every stack.
- [NavigationSequence.forward()](NavigationSequence/forward.md): Go forward to a URL, as a link does.
- [NavigationSequence.back()](NavigationSequence/back.md): Go back to a URL, as a back button does.
- [NavigationSequence.replace()](NavigationSequence/replace.md): Replace the current URL, with no transition.

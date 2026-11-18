# NavigationSequence

The store that holds the current URL, drives browser history, and keeps one stack of pages for each tab. It extends `URLStore`, so its `value` is the current URL. `<Navigation>` owns it. Read it with `requireNavigation()`, and do not make your own.

**Things to know:**

- `NavigationSequence.stacks` is the root path of each stack, in tab order, from the `stacks` prop on `<Navigation>`. `/` is a normal stack root, like any other path.
- A page that is not in a listed stack is **floating**: its stack is `null`. See [Floating pages](#floating-pages).
- In a listed stack, ordinal `0` is always the stack's root path. A deeper page always has the root below it.
- `NavigationSequence.stack` is a sub-store that holds the root of the current stack, or `null` on a floating page. It changes only when the stack changes, so `useStore(nav.stack)` re-renders only on a tab change.
- `NavigationSequence.path` is the current path relative to the app root, without its `?query`.
- `NavigationSequence.history()` returns the pages in the current stack (or a given stack), root first.
- `NavigationSequence.position` is the current stack and ordinal, the ordinal of the top page of each stack, and the page before this one. `<RouteCache>` and `<BackButton>` use it.
- All URLs resolve against the store's `base`. Each method also takes a full same-origin URL.
- Without the browser Navigation API there is no stack history: `stack` stays the starting stack, `history()` returns `[]`, `position` is `undefined`, and every `stack` argument is ignored. `forward()` and `back()` push a history entry, and `replace()` replaces it.

## Methods

| Method                  | What it does                                                                                                                                                                                                                                      | Slide                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `forward(href, stack?)` | Opens `href` as a new page on top of the stack. If `href` is the top page of another stack, it switches to that stack (a tab switch). If `href` is the current URL, it is a replace.                                                              | Forward. Across stacks, by tab order. |
| `back(href, stack?)`    | Goes back to `href`. If `href` is in the stack, the stack goes back to it, and the pages above it leave the stack. If `href` is the root of the stack, the stack goes to its root. Otherwise `href` takes the place of the top page of the stack. | Back                                  |
| `replace(href, stack?)` | Changes the URL of the current page. The stack, the ordinal and the mounted page stay the same. No new history entry. With another `stack`, the page moves into that stack: at its root if `href` is the root, else on top of its pages.          | None                                  |
| `history(stack?)`       | Returns the pages in `stack`, root first.                                                                                                                                                                                                         | —                                     |

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

The store saves a small state on each browser history entry: the `stack` the page is in, and its `ordinal` in that stack (`0` is the root). See `NavigationEntryState`. To read a stack, the store walks back through the browser history from the current entry. It takes the newest entry in that stack, then the newest earlier entry with a lower ordinal, and so on down to ordinal `0`.

Why ordinal? A browser history entry cannot be changed or removed. So when you go back in one stack while another stack's pages are after it in the history, the store cannot go back in the browser. It pushes a new entry for the page you went back to, at that page's ordinal. The pages that were above it now have a higher ordinal than the newest entry, so they are no longer in the stack.

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

Read the current stack in a component:

```tsx
import { useStore } from "shelving/react";
import { requireNavigation } from "shelving/ui";

function TabTitle() {
	const nav = requireNavigation();
	const stack = useStore(nav.stack).value;
	return <h1>{stack === "/profile" ? "Profile" : "Home"}</h1>;
}
```

List the pages in a stack (for example, for breadcrumbs):

```tsx
const nav = requireNavigation();
nav.history("/home"); // ["/home", "/home/post/1", "/home/post/1/comments"]
```

Make a store by hand only in tests:

```tsx
import { NavigationSequence } from "shelving/ui";

// URL, root, starting stack, then the stacks in tab order.
const nav = new NavigationSequence("https://example.com/home", "https://example.com/", "/home", "/home", "/profile");
nav.forward("/home/post/1");
```

# UI utilities

Low-level helpers shared across every UI component. You rarely call these directly in application code — they are the building blocks that every component in the library uses internally.

## CSS classes — `getClass` and `getModuleClass`

These two functions appear in almost every component in the library. Every component that accepts variant props (`small`, `primary`, `plain`, etc.) uses them to build its `className`.

**`getClass(...classes)`** joins any mix of strings, `null`/`undefined` (ignored), nested arrays, and `Variants` objects into a single class string. A `Variants` object is a plain boolean dictionary: keys whose value is strictly `true` are included; all others are ignored. This means you can pass component `props` directly and boolean variant flags are picked up automatically.

```ts
import { getClass } from "shelving/ui";

getClass("button", null, { primary: true, small: false });
// → "button primary"

getClass("box", ["a", "b"]);
// → "box a b"
```

**`getModuleClass(module, ...classes)`** does the same but maps each resolved class name through a CSS module dictionary, yielding only hashed names that exist in the module. If `module` is not a CSS module object (e.g. the environment doesn't process `.module.css` files) it returns `undefined` silently — components degrade gracefully.

```ts
import { getModuleClass } from "shelving/ui";
import BUTTON_CSS from "./Button.module.css";

// Inside a component — pass the base class name and then the whole props object.
getModuleClass(BUTTON_CSS, "button", variants);
// → hashed class string containing "button" plus any matching true-valued variant keys
```

The canonical component pattern combines both:

```tsx
export function Button({ children, ...variants }: ButtonProps): ReactElement {
  return (
    <button
      className={getClass(
        BLOCK_CLASS, //
        getModuleClass(BUTTON_CSS, "button", variants),
      )}
    >
      {children}
    </button>
  );
}
```

The `Classes` type describes all accepted input forms: `string | null | undefined | Classes[] | Variants`.

## Context — `requireContext`

**`requireContext(context, caller?)`** reads a React context and throws `RequiredError` if the value is `null` or `undefined`. Use it instead of `use(context)` when a context must be provided by an ancestor. All `require*()` hooks in the library follow this pattern.

```ts
import { requireContext } from "shelving/ui";

function requireNavigation(): NavigationStore {
  return requireContext(NavigationContext, requireNavigation);
}
```

## Metadata — `Meta` and `PossibleMeta`

Types and functions for page-level metadata (URL, title, description, CSP, stylesheets, etc.). Key exports:

- **`Meta`** — the canonical metadata shape used internally.
- **`PossibleMeta`** — the looser input shape accepted by `<HTML>`, `<Navigation>`, `<Router>`, and `<TreeApp>` props.
- **`mergeMeta(meta1, meta2)`** — merges two `Meta` objects, resolving URLs, joining titles (`"Page - App"`), and absolutifying asset hrefs.
- **`createMeta(possible)`** — initialises a `Meta` from a `PossibleMeta` from scratch.
- **`joinTitles(...titles)`** — joins non-empty titles with ` - `.
- **`joinMetaCSP(csp)`** — serialises a structured CSP object to a string.

You interact with `PossibleMeta` mostly via component props (`url`, `root`, `title`, `description`, etc.) rather than calling the merge helpers directly.

## Notice dispatch — `notify` family

A thin event bus for toast-style notifications. Components dispatch custom events on the DOM; `<Notices>` listens and displays them. See [ui/notice](/ui/notice) for the components.

| Function | What it does |
|---|---|
| `notify(message, status?, el?)` | Dispatch a notice event (defaults to `window`) |
| `notifySuccess(message, el?)` | Shorthand for a success notice |
| `notifyError(message, el?)` | Shorthand for an error notice |
| `notifyThrown(thrown, el?)` | Extract a message from a caught value and dispatch an error |
| `callNotified(callback, ...args)` | Run a callback; dispatch success or error automatically |
| `awaitNotified(promise)` | Same for an already-pending promise |
| `subscribeNotices(callback, el?)` | Listen for notice events; returns an unsubscribe function |

```ts
import { callNotified } from "shelving/ui";

// Return a string for success; throw (a string) for error.
callNotified(async () => {
  await saveData();
  return "Saved!";
});
```

## Scroll — `useScrollIntersect` and `getMostVisibleObserverEntry`

**`useScrollIntersect(onEnter?, onLeave?)`** attaches an `IntersectionObserver` to an element ref and fires callbacks when it enters or leaves the visible area. Returns a `RefObject` to attach to the target DOM element.

**`getMostVisibleObserverEntry(entries)`** picks the `IntersectionObserverEntry` with the highest `intersectionRatio` from an `IntersectionObserver` callback's entry list.

## State — `useDebouncedState` and `useDebouncedCallback`

**`useDebouncedState(initial, delay?)`** returns `[value, setter]`. The setter delays updating state until `delay` ms after the last call (default 500 ms). Use for search inputs that should wait for the user to stop typing.

**`useDebouncedCallback(callback, delay?)`** returns a debounced version of `callback`. Automatically clears any pending timeout on unmount.

```ts
import { useDebouncedState } from "shelving/ui";

const [query, setQuery] = useDebouncedState("", 300);
```

## Focus — `focusFirstFocusable`, `loopFocus`, `eventLoopFocus`

Helpers for keyboard and focus management inside dialogs and menus:

- **`focusFirstFocusable(el)`** — moves focus to the first focusable descendant of `el`.
- **`loopFocus(element, nextTarget)`** — if `nextTarget` is outside `element`, loops focus back to the first focusable child inside it.
- **`eventLoopFocus(event)`** — convenience wrapper for use directly as an `onBlur` event handler.

## Refresh — `useRefresh`

**`useRefresh(interval)`** forces a component to re-render every `interval` milliseconds. Use for live clocks, countdown timers, or any display that must stay current without an external store.

```ts
import { useRefresh } from "shelving/ui";

useRefresh(1000); // re-render every second
```

## See also

- [ui/notice](/ui/notice) — `<Notice>`, `<Notices>`, and the store layer built on top of the `notify` helpers
- [ui/router](/ui/router) — uses `requireContext` and `PossibleMeta` from this module
- [ui/tree](/ui/tree) — tree shell components that use `getClass`/`getModuleClass` throughout

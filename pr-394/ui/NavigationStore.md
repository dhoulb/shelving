# NavigationStore

- Kind: class
- Import: `import { NavigationStore } from "shelving/ui";`
- Extends: `URLStore`

Store holding the current navigation URL and driving browser history.

- Extends `URLStore`; the current location is its `value`.
- `forward()` pushes a new history entry; `redirect()` replaces the current one.
- `back()` pushes a new history entry like `forward()`, but `<Navigation>` animates it as a back transition.
- TODO: switch to the browser Navigation API when broadly supported.

The store holding the current navigation URL and driving browser history. It extends `URLStore` — the current location is its `value` — and is owned by `<Navigation>`. Reach for it via `requireNavigation()` rather than constructing your own.

**Things to know:**

- `forward()` pushes a new browser history entry; `redirect()` replaces the current one. Both resolve the destination against the store's `base`.
- `back()` pushes a new browser history entry like `forward()`, but `<Navigation>` gives it the `"back"` transition type, so the page slides back. It does not go back in the browser history, so it works when the page was opened directly.
- It is a `shelving/store` `URLStore`, so components can subscribe to it for re-renders.

## Usage

```tsx
import { requireNavigation } from "shelving/ui";

function LogoutButton() {
  const nav = requireNavigation();
  return <Button onClick={() => nav.redirect("/login")}>Log out</Button>;
}
```

Constructed directly only when wiring navigation by hand (e.g. tests):

```tsx
import { NavigationStore } from "shelving/ui";

const nav = new NavigationStore("/");
nav.forward("/home");
```


## Signatures

```ts
new NavigationStore(url: PossibleURL = typeof window === "undefined" ? "/" : window.location.href, base?: PossibleURL)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `url` | `PossibleURL` | Defaults to `typeof window === "undefined" ? "/" : window.location.href`. |
| `base` | `PossibleURL` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `NavigationStore` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `transition` | `TransitionType \| null` | Transition type of the next URL change. `null` means no transition. `<Navigation>` reads it, then sets it back to `"forward"`. Defaults to `"forward"`. |

## Methods

- [NavigationStore.forward()](NavigationStore/forward.md): Navigate forward to a URL, pushing a new browser history entry.
- [NavigationStore.redirect()](NavigationStore/redirect.md): Redirect to a URL, replacing the current browser history entry.
- [NavigationStore.back()](NavigationStore/back.md): Navigate back to a URL, pushing a new browser history entry with the "back" transition type.

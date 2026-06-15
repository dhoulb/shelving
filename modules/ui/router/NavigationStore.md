# NavigationStore

The store holding the current navigation URL and driving browser history. It extends `URLStore` — the current location is its `value` — and is owned by [`Navigation`](/ui/Navigation). Reach for it via [`requireNavigation()`](/ui/Navigation) rather than constructing your own.

**Things to know:**

- `forward()` pushes a new browser history entry; `redirect()` replaces the current one. Both resolve the destination against the store's `base`.
- It is a [`store`](/store) `URLStore`, so components can subscribe to it for re-renders.

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

## See also

- [`Navigation`](/ui/Navigation) — owns the store and exposes it via `requireNavigation()`
- [`Router`](/ui/Router) — renders the page for whatever URL the store holds
- [`store`](/store) — the `URLStore` base and subscription model

# notify

Dispatches a `notice` event so the global `<Notices>` list can display it. This is a thin event bus for toast-style notifications: components dispatch custom events on the DOM and `<Notices>` listens and renders them — no context required.

**Things to know:**

- The event bubbles, so any ancestor subscribed with `subscribeNotices()` receives it; it defaults to dispatching on `window`.
- A family of helpers builds on `notify`:

| Function | What it does |
|---|---|
| `notify(message, status?, el?)` | Dispatch a notice event (defaults to `window`) |
| `notifySuccess(message, el?)` | Shorthand for a `"success"` notice |
| `notifyError(message, el?)` | Shorthand for an `"error"` notice |
| `notifyThrown(thrown, el?)` | Extract a message from a caught value and dispatch an error |
| `callNotified(callback, ...args)` | Run a callback; dispatch success or error automatically |
| `awaitNotified(promise)` | Same for an already-pending promise |
| `subscribeNotices(callback, el?)` | Listen for notice events; returns an unsubscribe function |

## Usage

```ts
import { notifySuccess, notifyError } from "shelving/ui";

notifySuccess("Profile updated.");
notifyError("Could not connect.");
```

```ts
import { callNotified } from "shelving/ui";

// Return a string for success; throw for error.
callNotified(async () => {
  await saveData();
  return "Saved!";
});
```

```ts
import { subscribeNotices } from "shelving/ui";

const stop = subscribeNotices((message, status) => show(message, status));
// Call stop() to remove the listener.
```

## See also

- [`Notices`](/ui/Notices) — the global list that listens for these events and renders them.
- [`Notice`](/ui/Notice) — the callout each notice is rendered as.
- [`store`](/store) — the `ArrayStore` / `DataStore` layer behind the global notices.

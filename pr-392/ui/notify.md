# notify()

- Kind: function
- Import: `import { notify } from "shelving/ui";`

Notify the user with a message by dispatching a `notice` event.

- This is how e.g. `<Button>` and `<FormNotify>` components send notices to the `<Notices>` list of global notices.
- The event bubbles, so any ancestor subscribed with `subscribeNotices()` will receive it.

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


## Signatures

```ts
notify(message: ReactNode, status?: Status | undefined, el: EventTarget = window): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `ReactNode` | The message to show, as a React node. |
| `status` | `Status \| undefined` | Optional status (`"success"`, `"error"`, etc.) controlling how the notice is styled. Optional. |
| `el` | `EventTarget` | Element to dispatch the event on (defaults to `window`). Defaults to `window`. |

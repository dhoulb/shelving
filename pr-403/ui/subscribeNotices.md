# subscribeNotices()

- Kind: function
- Import: `import { subscribeNotices } from "shelving/ui";`

Subscribe to `notice` events on an element and call a callback when they happen.

- Stops propagation so the notice is not handled again by a higher subscriber.

## Signatures

```ts
subscribeNotices(callback: (message: ReactNode, status?: Status | undefined) => void, el: EventTarget = window): () => void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `callback` | `(message: ReactNode, status?: Status \| undefined) => void` | Called with the message and status each time a notice event fires. |
| `el` | `EventTarget` | Element to subscribe on (defaults to `window`). Defaults to `window`. |

## Returns

| Type | Description |
| --- | --- |
| `() => void` | An unsubscribe function that removes the listener. |

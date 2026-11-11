# notifyThrown()

- Kind: function
- Import: `import { notifyThrown } from "shelving/ui";`

Look at a thrown value, extract a viable message from it, and dispatch an error notice.

- Uses `getMessage()` to pull a human-readable string from the thrown value.
- Falls back to a generic `"Unknown error"` notice and `console.error()` when no message can be extracted.

## Signatures

```ts
notifyThrown(thrown: unknown, el?: EventTarget): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `thrown` | `unknown` | The thrown value to report. |
| `el` | `EventTarget` | Element to dispatch the event on (defaults to `window`). Optional. |

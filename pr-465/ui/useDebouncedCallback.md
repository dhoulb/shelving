# useDebouncedCallback()

- Kind: function
- Import: `import { useDebouncedCallback } from "shelving/ui";`

Wrap a callback so it only runs after a debounce delay since the last invocation.

- Each call resets the timer, so the callback fires once `delay` milliseconds have passed without another call — useful for auto-submitting a form after the user stops typing.
- Pending timeouts are cleared automatically on unmount.

## Signatures

```ts
useDebouncedCallback(callback: (() => void) | undefined, delay = 500): () => void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `callback` | `(() => void) \| undefined` | The callback to debounce (may be `undefined` to no-op). |
| `delay` | `unknown` | The debounce delay in milliseconds (defaults to `500`). Defaults to `500`. |

## Returns

| Type | Description |
| --- | --- |
| `() => void` | A debounced function that schedules `callback` after `delay`. |

## Examples

```ts
const submit = useDebouncedCallback(() => form.submit());
```

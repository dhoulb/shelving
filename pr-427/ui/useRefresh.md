# useRefresh()

- Kind: function
- Import: `import { useRefresh } from "shelving/ui";`

Re-render a component automatically on a fixed interval.

- Holds the current time in state and updates it every `interval` milliseconds, forcing a refresh.
- Clears the timer on unmount or when `interval` changes.

## Signatures

```ts
useRefresh(interval: number): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `interval` | `number` | The refresh period in milliseconds. |

## Examples

```ts
useRefresh(1000); // re-renders once per second, e.g. for a live clock
```

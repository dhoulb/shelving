# useDebouncedState()

- Kind: function
- Import: `import { useDebouncedState } from "shelving/ui";`

Hold a piece of state that only updates after a debounce delay since the last set.

- The state changes only once `delay` milliseconds have elapsed with no further sets — useful for waiting until a user stops typing before reacting.

## Signatures

```ts
useDebouncedState(initial: T, delay = 500): [T, (v: T) => void]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `initial` | `T` | The initial state value. |
| `delay` | `unknown` | The debounce delay in milliseconds (defaults to `500`). Defaults to `500`. |

## Returns

| Type | Description |
| --- | --- |
| `[T, (v: T) => void]` | A `[state, setState]` tuple, where `setState` defers the update by `delay`. |

## Examples

```ts
const [query, setQuery] = useDebouncedState("");
```

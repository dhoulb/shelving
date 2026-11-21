# debugSet()

- Kind: function
- Import: `import { debugSet } from "shelving/util/debug";`

Convert a `Set` into a readable debug string.
- Prefixes the constructor name and item count.
- Expands items down to `depth` levels.

## Signatures

```ts
debugSet(value: ImmutableSet, depth = 1): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `ImmutableSet` | The set to debug. |
| `depth` | `unknown` | How many levels of nested containers to expand (defaults to `1`). Defaults to `1`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A human-readable string representation of the set. |

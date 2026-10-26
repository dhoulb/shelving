# debugArray()

- Kind: function
- Import: `import { debugArray } from "shelving/util/debug";`

Convert an array into a readable debug string.
- Prefixes the constructor name for non-plain arrays.
- Expands items down to `depth` levels.

## Signatures

```ts
debugArray(value: ImmutableArray, depth = 1): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `ImmutableArray` | The array to debug. |
| `depth` | `unknown` | How many levels of nested containers to expand (defaults to `1`). Defaults to `1`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A human-readable string representation of the array. |

# debugMap()

- Kind: function
- Import: `import { debugMap } from "shelving/util/debug";`

Convert a `Map` into a readable debug string.
- Prefixes the constructor name and entry count.
- Expands keys and values down to `depth` levels.

## Signatures

```ts
debugMap(value: ImmutableMap, depth = 1): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `ImmutableMap` | The map to debug. |
| `depth` | `unknown` | How many levels of nested containers to expand (defaults to `1`). Defaults to `1`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A human-readable string representation of the map. |

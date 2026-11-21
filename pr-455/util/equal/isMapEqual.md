# isMapEqual()

- Kind: function
- Import: `import { isMapEqual } from "shelving/util/equal";`

Are two maps equal based on their items?

## Signatures

```ts
isMapEqual(left: ImmutableMap, right: T, recursor: Match = isEqual): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `ImmutableMap` | The map to check and narrow. |
| `right` | `T` | The map to compare against. |
| `recursor` | `Match` | Function that checks each value of the map (defaults to `isEqual()` for strict equality; pass `isDeepEqual()` for deep equality). Defaults to `isEqual`. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if both maps have the same keys and matching values. |

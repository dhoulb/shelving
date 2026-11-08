# limitMap()

- Kind: function
- Import: `import { limitMap } from "shelving/util/map";`

Apply a limit to a map.
- Returns the input map unchanged if the limit is not smaller than its size.

## Signatures

```ts
limitMap(map: ImmutableMap<T>, limit: number): ImmutableMap<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `ImmutableMap<T>` | The map to limit. |
| `limit` | `number` | The maximum number of items to keep. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableMap<T>` | An `ImmutableMap` with at most `limit` items (the input map unchanged if it already fits). |

# getMap()

- Kind: function
- Import: `import { getMap } from "shelving/util/map";`

Convert an iterable to a `Map` (if it's already a `Map` it passes through unchanged).

## Signatures

```ts
getMap(input: PossibleStringMap<K, T>): ImmutableMap<K, T>
getMap(input: PossibleMap<K, T>): ImmutableMap<K, T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `PossibleStringMap<K, T>` | The map, object, or iterable of entries to convert. |
| `input` | `PossibleMap<K, T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableMap<K, T>` | An `ImmutableMap` — the input unchanged if it's already a `Map`, otherwise a new `Map`. |
| `ImmutableMap<K, T>` |  |

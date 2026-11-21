# isMapItem()

- Kind: function
- Import: `import { isMapItem } from "shelving/util/map";`

Is an unknown value a key for an item in a map?

## Signatures

```ts
isMapItem(map: ImmutableMap<K, V>, key: unknown): key is K
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `ImmutableMap<K, V>` | The map to look in. |
| `key` | `unknown` | The candidate key to test. |

## Returns

| Type | Description |
| --- | --- |
| `key is K` | `true` if `key` exists in `map`, otherwise `false`. |

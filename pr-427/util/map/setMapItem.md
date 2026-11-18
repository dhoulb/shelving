# setMapItem()

- Kind: function
- Import: `import { setMapItem } from "shelving/util/map";`

Set an item in a map (by reference) and return the value that was set.

## Signatures

```ts
setMapItem(map: MutableMap<K, T>, key: K, value: T): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `MutableMap<K, T>` | The mutable map to set the item on. |
| `key` | `K` | The key to set. |
| `value` | `T` | The value to set. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The `value` that was set. |

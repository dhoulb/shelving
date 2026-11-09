# setMapItems()

- Kind: function
- Import: `import { setMapItems } from "shelving/util/map";`

Add multiple items to a map (by reference).

## Signatures

```ts
setMapItems(map: MutableMap<K, T>, items: Iterable<MapItem<ImmutableMap<K, T>>>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `MutableMap<K, T>` | The mutable map to set the items on. |
| `items` | `Iterable<MapItem<ImmutableMap<K, T>>>` | Iterable of key/value entries to set. |

## Returns

| Type | Description |
| --- | --- |
| `void` | Nothing; mutates `map` in place. |

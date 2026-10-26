# removeMapItems()

- Kind: function
- Import: `import { removeMapItems } from "shelving/util/map";`

Remove multiple items from a map (by reference).

## Signatures

```ts
removeMapItems(map: MutableMap<K, T>, ...keys: K[]): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `MutableMap<K, T>` | The mutable map to remove the items from. |
| `keys` | `K[]` | The keys to delete. |

## Returns

| Type | Description |
| --- | --- |
| `void` | Nothing; mutates `map` in place. |

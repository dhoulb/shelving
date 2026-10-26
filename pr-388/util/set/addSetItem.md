# addSetItem()

- Kind: function
- Import: `import { addSetItem } from "shelving/util/set";`

Add an item to a set (by reference) and return the set item.
- Mutates `set` in place.

## Signatures

```ts
addSetItem(set: MutableSet<T>, item: T): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `set` | `MutableSet<T>` | The mutable set to add to. |
| `item` | `T` | The item to add. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The added `item`. |

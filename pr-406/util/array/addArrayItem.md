# addArrayItem()

- Kind: function
- Import: `import { addArrayItem } from "shelving/util/array";`

Add an item to an array (by reference) and return the item.
- Skip items that already exist.

## Signatures

```ts
addArrayItem(arr: MutableArray<T>, item: T): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `MutableArray<T>` | The array to add to (modified in place). |
| `item` | `T` | The item to add. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The added `item`. |

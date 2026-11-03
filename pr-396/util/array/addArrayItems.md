# addArrayItems()

- Kind: function
- Import: `import { addArrayItems } from "shelving/util/array";`

Add multiple items to an array (by reference).
- Skip items that already exist.

## Signatures

```ts
addArrayItems(arr: MutableArray<T>, ...items: T[]): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `MutableArray<T>` | The array to add to (modified in place). |
| `items` | `T[]` | The items to add. |

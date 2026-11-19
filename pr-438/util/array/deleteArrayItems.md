# deleteArrayItems()

- Kind: function
- Import: `import { deleteArrayItems } from "shelving/util/array";`

Remove multiple items from an array (by reference).

## Signatures

```ts
deleteArrayItems(arr: MutableArray<T>, ...items: T[]): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `MutableArray<T>` | The array to remove from (modified in place). |
| `items` | `T[]` | The items to remove. |

# deleteSetItems()

- Kind: function
- Import: `import { deleteSetItems } from "shelving/util/set";`

Remove multiple items from a set (by reference).
- Mutates `set` in place.

## Signatures

```ts
deleteSetItems(set: MutableSet<T>, ...items: T[]): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `set` | `MutableSet<T>` | The mutable set to remove from. |
| `items` | `T[]` | The items to remove. |

## Returns

| Type | Description |
| --- | --- |
| `void` | Nothing. |

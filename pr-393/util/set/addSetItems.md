# addSetItems()

- Kind: function
- Import: `import { addSetItems } from "shelving/util/set";`

Add multiple items to a set (by reference).
- Mutates `set` in place.

## Signatures

```ts
addSetItems(set: MutableSet<T>, ...items: T[]): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `set` | `MutableSet<T>` | The mutable set to add to. |
| `items` | `T[]` | The items to add. |

## Returns

| Type | Description |
| --- | --- |
| `void` | Nothing. |

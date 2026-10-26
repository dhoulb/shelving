# omitArrayItems()

- Kind: function
- Import: `import { omitArrayItems } from "shelving/util/array";`

Remove multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made).

## Signatures

```ts
omitArrayItems(items: PossibleArray<T>, ...omit: T[]): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to remove from. |
| `omit` | `T[]` | The items to remove. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array without the omitted items, or the same array if nothing changed. |

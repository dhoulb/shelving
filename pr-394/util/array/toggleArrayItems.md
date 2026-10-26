# toggleArrayItems()

- Kind: function
- Import: `import { toggleArrayItems } from "shelving/util/array";`

Toggle an item in and out of an array (immutably) and return a new array with or without the specified items (or the same array if no changes were made).

## Signatures

```ts
toggleArrayItems(items: PossibleArray<T>, ...toggle: T[]): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to toggle within. |
| `toggle` | `T[]` | The items to toggle (added if absent, removed if present). |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array with the items toggled, or the same array if nothing changed. |

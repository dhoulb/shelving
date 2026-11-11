# withArrayItems()

- Kind: function
- Import: `import { withArrayItems } from "shelving/util/array";`

Add multiple items to an array (immutably) and return a new array with those items (or the same array if no changes were made).

## Signatures

```ts
withArrayItems(list: PossibleArray<T>, ...add: T[]): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `list` | `PossibleArray<T>` | The array or iterable to add to. |
| `add` | `T[]` | The items to add (items already present are skipped). |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array including the added items, or the same array if nothing changed. |

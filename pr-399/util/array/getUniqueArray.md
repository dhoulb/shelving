# getUniqueArray()

- Kind: function
- Import: `import { getUniqueArray } from "shelving/util/array";`

Return an array of the unique items in an array.

## Signatures

```ts
getUniqueArray(list: PossibleArray<T>): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `list` | `PossibleArray<T>` | The array or iterable to deduplicate. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array with duplicate items removed, or the same array if all items were already unique. |

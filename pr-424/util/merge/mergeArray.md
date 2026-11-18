# mergeArray()

- Kind: function
- Import: `import { mergeArray } from "shelving/util/merge";`

Merge two arrays.
- Values are considered unique so values will not appear twice.
- Arrays have no concept of `deep merge` because array keys are not stable.
- Use an map/object data structure instead for values that need to be deeply mergeable (only use arrays for primitive values).

## Signatures

```ts
mergeArray(left: ImmutableArray<L>, right: ImmutableArray<R> | ImmutableArray<L>): ImmutableArray<L | R>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `ImmutableArray<L>` | The left array to merge into. |
| `right` | `ImmutableArray<R> \| ImmutableArray<L>` | The right array whose unique items are merged in. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<L \| R>` | Merged array. - Values that appear in both arrays will not be added twice. - Will be `left` instance if no items were added. - Will be a new merged array otherwise. |

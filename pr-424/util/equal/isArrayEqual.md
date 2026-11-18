# isArrayEqual()

- Kind: function
- Import: `import { isArrayEqual } from "shelving/util/equal";`

Are two arrays equal based on their items?

## Signatures

```ts
isArrayEqual(left: ImmutableArray, right: T, recursor: Match = isEqual): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `ImmutableArray` | The array to check and narrow. |
| `right` | `T` | The array to compare against. |
| `recursor` | `Match` | Function that checks each item of the array. - Defaults to `isEqual()` to check strict equality of the items. - Use `isDeepEqual()` as the recursor to check to check deep equality of the items. Defaults to `isEqual`. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if both arrays have the same length and matching items. |

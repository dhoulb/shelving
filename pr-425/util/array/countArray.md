# countArray()

- Kind: function
- Import: `import { countArray } from "shelving/util/array";`

Count the items in an array.

## Signatures

```ts
countArray(arr: ImmutableArray<T>): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `ImmutableArray<T>` | The array to count. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The number of items in `arr`. |

## Examples

```ts
countArray([1, 2, 3]) // 3
```

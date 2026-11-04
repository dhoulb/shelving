# omitArrayIndex()

- Kind: function
- Import: `import { omitArrayIndex } from "shelving/util/array";`

Return a new array without a specific index in the array (or the same array if the value was unchanged).

## Signatures

```ts
omitArrayIndex(arr: ImmutableArray<T>, index: number): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `ImmutableArray<T>` | The array to update. |
| `index` | `number` | The index to remove. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array without `index`, or the same array if nothing changed. |

# withArrayIndex()

- Kind: function
- Import: `import { withArrayIndex } from "shelving/util/array";`

Return a new array with a new value replacing a specific index in the array (or the same array if the value was unchanged).

## Signatures

```ts
withArrayIndex(arr: ImmutableArray<T>, index: number, value: T): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `ImmutableArray<T>` | The array to update. |
| `index` | `number` | The index to replace. |
| `value` | `T` | The new value to set at `index`. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array with `value` at `index`, or the same array if the value was unchanged. |

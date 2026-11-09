# sortArray()

- Kind: function
- Import: `import { sortArray } from "shelving/util/sort";`

Sort an iterable set of items using a ranker (defaults to sorting in ascending order).
- When the input is already an array and the sort makes no change, the original array reference is returned unchanged.

## Signatures

```ts
sortArray(input: ImmutableArray<T> | Iterable<T>, compare: Compare<T, A> = compareAscending as unknown as Compare<T, A>, ...args: A): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `ImmutableArray<T> \| Iterable<T>` | The array or iterable of items to sort. |
| `compare` | `Compare<T, A>` | A `Compare` function ranking two items (defaults to `compareAscending()`). Defaults to `compareAscending as unknown as Compare<T, A>`. |
| `args` | `A` | Extra arguments forwarded to `compare` on each call. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A sorted array (the original reference if it was an already-sorted array). |

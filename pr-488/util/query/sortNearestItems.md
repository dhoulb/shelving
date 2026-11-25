# sortNearestItems()

- Kind: function
- Import: `import { sortNearestItems } from "shelving/util/query";`

Sort a set of data items by a nearest sort: the highest dot product of the vector at `key` with `value` comes first.
- The vector at `key` can be a `VectorArray` or any shape `getVectorArray()` reads, so providers that store data as JSON still sort correctly.
- Items with no vector at `key`, or a vector of another size, are left out, the same as Firestore's `findNearest`.

## Signatures

```ts
sortNearestItems(items: Iterable<T>, { key, value }: QueryNearest): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable of data items to sort. |
| `nearest` | `QueryNearest` | The nearest sort to apply. |
| `.key` | `Segments` |  |
| `.value` | `VectorArray` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new sorted array, without the items that have no vector of the right size. |

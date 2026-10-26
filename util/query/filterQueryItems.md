# filterQueryItems()

- Kind: function
- Import: `import { filterQueryItems } from "shelving/util/query";`

Filter a set of data items using a set of filters.

@yields Items that match every filter (yields all items when `filters` is empty).

## Signatures

```ts
filterQueryItems(items: Iterable<T>, filters: ImmutableArray<QueryFilter>): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable of data items to filter. |
| `filters` | `ImmutableArray<QueryFilter>` | The set of filters that each yielded item must satisfy. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` |  |

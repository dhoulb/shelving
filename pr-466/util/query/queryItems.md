# queryItems()

- Kind: function
- Import: `import { queryItems } from "shelving/util/query";`

Query a set of data items using a query.
- Filters, then sorts, then limits the items according to the query.

## Signatures

```ts
queryItems(items: Iterable<T>, query: Query<T>): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable of data items to query. |
| `query` | `Query<T>` | The query to apply (filters, sort order, and limit). |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | Iterable of items matching the query, in sorted and limited order. |

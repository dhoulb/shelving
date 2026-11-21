# queryWritableItems()

- Kind: function
- Import: `import { queryWritableItems } from "shelving/util/query";`

Query a set of data items for writing using a query.
- If no limit is set on the data sorting can be avoided too for performance reasons.

## Signatures

```ts
queryWritableItems(items: Iterable<T>, query: Query<T>): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable of data items to query. |
| `query` | `Query<T>` | The query to apply (filters, sort order, and limit). |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | Iterable of matching items (skips sorting when the query has no limit). |

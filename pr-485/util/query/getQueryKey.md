# getQueryKey()

- Kind: function
- Import: `import { getQueryKey } from "shelving/util/query";`

Get a cache key for a query, so two queries with the same filters, order, and limit get the same key.
- Uses `serialise()`, so `{ a, b }` and `{ b, a }` give the same key.
- Ignores props with an `undefined` value, like `getQueryFilters()`.
- Keeps the order of values, so `$order` arrays and `in` lists keep their meaning.
- Treat the key as an opaque string. Only compare it for equality. Do not parse it or read data from it, because its format can change.

## Signatures

```ts
getQueryKey(query: Query<T> | undefined): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T> \| undefined` | The query to get the key for, or `undefined` for a query with no filters. |

## Returns

| Type | Description |
| --- | --- |
| `string` | An opaque string that is the same for equal queries. |

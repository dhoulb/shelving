# getQueryFilters()

- Kind: function
- Import: `import { getQueryFilters } from "shelving/util/query";`

Get the `QueryFilter` objects decoded from a query.

## Signatures

```ts
getQueryFilters(query: Query<T>): ImmutableArray<QueryFilter>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T>` | The query to extract filters from. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<QueryFilter>` | Array of decoded `QueryFilter` objects (excludes `$order` and `$limit` and any `undefined` values). |

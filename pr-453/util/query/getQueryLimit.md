# getQueryLimit()

- Kind: function
- Import: `import { getQueryLimit } from "shelving/util/query";`

Get the limit for a query.

## Signatures

```ts
getQueryLimit({ $limit }: Query<T>): number | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T>` | The query to read the limit from (reads its `$limit` prop). |

## Returns

| Type | Description |
| --- | --- |
| `number \| undefined` | The maximum number of results, or `undefined` if the query is unlimited. |

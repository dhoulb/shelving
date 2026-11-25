# getQueryNearest()

- Kind: function
- Import: `import { getQueryNearest } from "shelving/util/query";`

Get the "nearest" sort of a query, from its `key~` prop, or `undefined` if it has none.
- A query has at most one nearest sort. It replaces `$order`, so a query cannot have both.
- A nearest query cannot page with `getQueryAfter()` or `getQueryBefore()`, because those need an `$order`. Ask for a bigger `$limit` instead.

## Signatures

```ts
getQueryNearest(query: Query<T>, caller: AnyCaller = getQueryNearest): QueryNearest | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T>` | The query to read. |
| `caller` | `AnyCaller` | Defaults to `getQueryNearest`. |

## Returns

| Type | Description |
| --- | --- |
| `QueryNearest \| undefined` | The decoded `QueryNearest`, or `undefined` if the query has no `key~` prop. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If a `key~` prop is not a `VectorArray`, the query has more than one, or it also has an `$order`. |

## Examples

```ts
getQueryNearest({ "vector~": v, $limit: 10 }) // { key: ["vector"], value: v }
```

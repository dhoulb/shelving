# getQueryItemsAfter()

- Kind: function
- Import: `import { getQueryItemsAfter } from "shelving/util/query";`

Get the query for the next page after a page of `QueryItems`, or `undefined` if there are no more items.
- There are no more items when the query has no `$limit`, or the page has fewer items than the `$limit`.
- The cursor is the last item of the page, so it comes from the page itself and never from a cache.
- The range is inclusive (see `getQueryAfter()`), so the `$limit` grows by the number of items with the same sort value as the last item. The next page repeats those items.

## Signatures

```ts
getQueryItemsAfter({ query, items }: QueryItems<I, T>, caller: AnyCaller = getQueryItemsAfter): Query<Item<I, T>> | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `queryItems` | `QueryItems<I, T>` | The page to continue from. Its query must have an `$order`. |
| `.query` | `Query<Item<I, T>>` | Read only. |
| `.items` | `Items<I, T>` | Read only. |
| `caller` | `AnyCaller` | Defaults to `getQueryItemsAfter`. |

## Returns

| Type | Description |
| --- | --- |
| `Query<Item<I, T>> \| undefined` | The query for the next page, or `undefined` if there are no more items. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the query has no `$order`, or the last item has no value for the first `$order` key. |

## Examples

```ts
getQueryItemsAfter({ query: { $order: "when", $limit: 2 }, items: [a, b] }) // { $order: "when", $limit: 3, "when>=": b.when }
```

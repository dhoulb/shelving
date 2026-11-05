# getQueryAfter()

- Kind: function
- Import: `import { getQueryAfter } from "shelving/util/query";`

Get a query for the items that sort at or after a specified item.
- For cursor-based paging towards the end of a result set.
- Adds an inclusive range on the first `$order` key only (`key>=` for an ascending order, `key<=` for a descending order), so items with the same value as `item` are included. Drop the items you already have by ID.
- Keeps the existing order and limit.
- Page on a first key with many distinct values (e.g. a timestamp). Many items with the same value make each page read them all again.

## Signatures

```ts
getQueryAfter(query: Query<T>, item: T, caller: AnyCaller = getQueryAfter): Query<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T>` | The query to page through. It must have an `$order`. |
| `item` | `T` | The item to page from (normally the last item already loaded). |
| `caller` | `AnyCaller` | Defaults to `getQueryAfter`. |

## Returns

| Type | Description |
| --- | --- |
| `Query<T>` | A new query with the range added. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the query has no `$order`, or `item` has no value for the first `$order` key. |

## Examples

```ts
getQueryAfter({ $order: "!when" }, { id: "a", when: 5 }) // { $order: "!when", "when<=": 5 }
```

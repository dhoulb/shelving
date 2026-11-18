# getQueryBefore()

- Kind: function
- Import: `import { getQueryBefore } from "shelving/util/query";`

Get a query for the items that sort at or before a specified item.
- For cursor-based paging towards the start of a result set.
- Adds an inclusive range on the first `$order` key only (`key<=` for an ascending order, `key>=` for a descending order), so items with the same value as `item` are included. Drop the items you already have by ID.
- Keeps the existing order and limit. To get the nearest items first, reverse the order before you set a limit.
- Page on a first key with many distinct values (e.g. a timestamp). Many items with the same value make each page read them all again.

## Signatures

```ts
getQueryBefore(query: Query<T>, item: T, caller: AnyCaller = getQueryBefore): Query<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `query` | `Query<T>` | The query to page through. It must have an `$order`. |
| `item` | `T` | The item to page from (normally the first item already loaded). |
| `caller` | `AnyCaller` | Defaults to `getQueryBefore`. |

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
getQueryBefore({ $order: "!when" }, { id: "a", when: 5 }) // { $order: "!when", "when>=": 5 }
```

# shelving/util/query

- Kind: module
- Import: `import { … } from "shelving/util/query";`

A `Query<T>` is a plain object that describes filters, ordering, and a result limit for a set of data items. These helpers parse, apply, and paginate queries — the same `Query` type that `shelving/db` uses for all collection reads.

**Things to know:**

- Query keys use an encoded syntax (see table below). Plain keys mean equality; special suffixes or prefixes change the operator.
- Passing an array as a value for a plain key (`key`) or negated key (`!key`) produces `in` / `out` membership checks.
- `$order` accepts a single key string or an array. Prefix `!` on a key means descending.
- `queryItems()` returns a lazy `Iterable<T>` — wrap with `Array.from()` when you need an array.
- `queryWritableItems()` skips sorting when no `$limit` is set, for write-path performance.
- `getQueryBefore()` / `getQueryAfter()` produce cursor queries for token-based pagination; the query must include `$order`.
- `getQueryItemsAfter()` gives the next page query for a page of `QueryItems` (a query and the items that answer it).

| Key syntax  | Meaning                                  |
| ----------- | ---------------------------------------- |
| `key`       | field equals value (or is in array)      |
| `!key`      | field does not equal value (or not in)   |
| `key[]`     | array field contains value               |
| `key>`      | field greater than value                 |
| `key>=`     | field greater than or equal to value     |
| `key<`      | field less than value                    |
| `key<=`     | field less than or equal to value        |
| `$order`    | sort field(s); prefix `!` = descending   |
| `$limit`    | maximum number of results                |

## Usage

### Querying a collection

```ts
import { queryItems } from "shelving/util";

const items = [
  { id: "1", status: "active", price: 10 },
  { id: "2", status: "inactive", price: 5 },
  { id: "3", status: "active", price: 20 },
];

const results = Array.from(
  queryItems(items, { status: "active", "price>": 8, $order: "price", $limit: 10 })
);
// [{ id: "1", price: 10, ... }, { id: "3", price: 20, ... }]
```

### Parsing a query's parts

```ts
import { getQueryFilters, getQueryOrders, getQueryLimit } from "shelving/util";

const query = { status: "active", "!tags[]": "archived", $order: ["name", "!price"], $limit: 20 };

getQueryFilters(query);
// [{ key: ["status"], operator: "is", value: "active" }, ...]

getQueryOrders(query);
// [{ key: ["name"], direction: "asc" }, { key: ["price"], direction: "desc" }]

getQueryLimit(query); // 20
```

### Step-by-step filtering, sorting, and limiting

```ts
import { filterQueryItems, sortQueryItems, limitQueryItems, getQueryFilters, getQueryOrders } from "shelving/util";

const filters = getQueryFilters({ status: "active" });
const orders  = getQueryOrders({ $order: "price" });

const filtered = filterQueryItems(items, filters);
const sorted   = sortQueryItems(filtered, orders);
const limited  = limitQueryItems(sorted, 5);
```

### Cursor-based pagination

`getQueryAfter()` and `getQueryBefore()` add an inclusive range on the first `$order` key. The range includes the items that have the same value as the cursor item, so drop the items you already have by ID, and ask for that many extra items.

```ts
import { queryItems, getQueryAfter } from "shelving/util";

const base = { $order: "!when", $limit: 10 };
const page1 = Array.from(queryItems(items, base));
const last  = page1[page1.length - 1];

// Next page — items at or after `last`, minus the ones already loaded.
const seen  = new Set(page1.map(item => item.id));
const ties  = page1.filter(item => item.when === last.when).length;
const page2 = Array.from(queryItems(items, { ...getQueryAfter(base, last), $limit: 10 + ties }))
  .filter(item => !seen.has(item.id))
  .slice(0, 10);
```

For one page of `QueryItems` from an API (a query and the items that answer it), `getQueryItemsAfter()` gives the query for the next page, with the `$limit` grown by the tied items. It returns `undefined` when the page is not full:

```ts
import { getQueryItemsAfter } from "shelving/util/query";

const next = getQueryItemsAfter(page); // { ...page.query, "when<=": last.when, $limit: 30 + ties } or undefined
```

### Matching a single item

```ts
import { matchQueryItem, getQueryFilters } from "shelving/util";

const filters = getQueryFilters({ status: "active", "price>=": 10 });
matchQueryItem({ id: "1", status: "active", price: 10 }, filters); // true
matchQueryItem({ id: "2", status: "inactive", price: 3 }, filters); // false
```


## Functions

- [getQueryFilters()](query/getQueryFilters.md): Get the QueryFilter objects decoded from a query.
- [getQueryOrders()](query/getQueryOrders.md): Get the QueryOrder objects decoded from a query.
- [getQueryLimit()](query/getQueryLimit.md): Get the limit for a query.
- [queryItems()](query/queryItems.md): Query a set of data items using a query.
- [queryWritableItems()](query/queryWritableItems.md): Query a set of data items for writing using a query.
- [matchQueryItem()](query/matchQueryItem.md): Match a single data item against a set of filters.
- [filterQueryItems()](query/filterQueryItems.md): Filter a set of data items using a set of filters.
- [compareQueryItems()](query/compareQueryItems.md): Compare two data items using a set of orders.
- [sortQueryItems()](query/sortQueryItems.md): Sort a set of data items using a set of orders.
- [limitQueryItems()](query/limitQueryItems.md): LImit a set of data items using a set of limit.
- [getQueryBefore()](query/getQueryBefore.md): Get a query for the items that sort at or before a specified item.
- [getQueryAfter()](query/getQueryAfter.md): Get a query for the items that sort at or after a specified item.
- [getQueryItemsAfter()](query/getQueryItemsAfter.md): Get the query for the next page after a page of QueryItems, or undefined if there are no more items.

## Types

- [Query](query/Query.md): Query that can be applied to a list of data objects.
- [QueryFilter](query/QueryFilter.md): A single filter that can be applied to a list of data objects.
- [QueryOrder](query/QueryOrder.md): A single sort order that can be applied to a list of data objects.
- [QueryItems](query/QueryItems.md): A query and the items that answer it, e.g. one page of results from an API endpoint.

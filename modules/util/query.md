# Query helpers

A `Query<T>` is a plain object that describes filters, ordering, and a result limit for a set of data items. These helpers parse, apply, and paginate queries — the same `Query` type that `shelving/db` uses for all collection reads.

**Things to know:**

- Query keys use an encoded syntax (see table below). Plain keys mean equality; special suffixes or prefixes change the operator.
- Passing an array as a value for a plain key (`key`) or negated key (`!key`) produces `in` / `out` membership checks.
- `$order` accepts a single key string or an array. Prefix `!` on a key means descending.
- `queryItems()` returns a lazy `Iterable<T>` — wrap with `Array.from()` when you need an array.
- `queryWritableItems()` skips sorting when no `$limit` is set, for write-path performance.
- `getBeforeQuery()` / `getAfterQuery()` produce cursor queries for token-based pagination; the query must include `$order`.

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

```ts
import { queryItems, getAfterQuery, getBeforeQuery } from "shelving/util";

const base = { $order: "price", $limit: 10 };
const page1 = Array.from(queryItems(items, base));
const last  = page1[page1.length - 1];

// Next page — items that come after `last`
const page2 = Array.from(queryItems(items, getAfterQuery(base, last)));

// Previous page — items that come before `last`
const prev  = Array.from(queryItems(items, getBeforeQuery(base, last)));
```

### Matching a single item

```ts
import { matchQueryItem, getQueryFilters } from "shelving/util";

const filters = getQueryFilters({ status: "active", "price>=": 10 });
matchQueryItem({ id: "1", status: "active", price: 10 }, filters); // true
matchQueryItem({ id: "2", status: "inactive", price: 3 }, filters); // false
```

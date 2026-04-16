# util

A large set of typed helper functions for working with arrays, objects, strings, numbers, dates, data objects, items, queries, updates, equality, and more. All helpers follow strict naming conventions and favour immutability — functions that return updated copies return the same reference when nothing changed, which matters for equality checks and memoisation.

## Concepts

### Naming conventions

| Prefix   | Behaviour                                                          | Example            |
| -------- | ------------------------------------------------------------------ | ------------------ |
| `is*`    | Type guard — returns `boolean`                                     | `isArray(v)`       |
| `assert*`| Throws `RequiredError` if invalid                                  | `assertArray(v)`   |
| `get*`   | Returns value or `undefined` — never throws                        | `getFirst(arr)`    |
| `require*` | Returns value or throws `RequiredError` if missing               | `requireFirst(arr)`|
| `with*`  | Returns immutable updated copy (same ref if unchanged)             | `withProp(obj, k, v)` |
| `omit*`  | Returns immutable copy with property/item removed                  | `omitProp(obj, k)` |

Mutable-by-reference counterparts use `add*`, `delete*`, and `set*`.

### Data vs Item

**Data** (`Data`) is a plain `Record<string, unknown>` — a JSON-safe object with no class prototype. **Item** (`Item<I, T>`) is a `Data` object that also has an `id` property of type `string | number`. Most database and query functions operate on items.

### Immutability

Immutable helpers (`withProp`, `withArrayItem`, `omitArrayItems`, etc.) always return the same reference when the result would be identical to the input. This makes them safe to use in React state, memoisation, and equality comparisons without extra diffing.

## Usage

### Arrays

```ts
import {
  isArray, assertArray, getFirst, requireFirst,
  withArrayItem, omitArrayItems, toggleArrayItem,
  getUniqueArray, limitArray, interleaveArray,
} from "shelving/util";

isArray([1, 2, 3]);             // true
isArray([1, 2], 3);             // false  (min 3 items)
getFirst([10, 20, 30]);         // 10
requireFirst([]);               // throws RequiredError

withArrayItem(["a", "b"], "c"); // ["a", "b", "c"]
withArrayItem(["a", "b"], "b"); // ["a", "b"]  (same ref, already present)
omitArrayItems(["a", "b", "c"], "b"); // ["a", "c"]
toggleArrayItem(["a", "b"], "b");     // ["a"]
toggleArrayItem(["a", "b"], "c");     // ["a", "b", "c"]

getUniqueArray([1, 2, 2, 3]);   // [1, 2, 3]
limitArray([1, 2, 3, 4], 2);    // [1, 2]
interleaveArray(["a", "b", "c"], ", "); // ["a", ", ", "b", ", ", "c"]
```

### Objects

```ts
import {
  isObject, isPlainObject, withProp, withProps, omitProp, omitProps, pickProps,
} from "shelving/util";

isObject(null);         // false
isObject({});           // true
isPlainObject(new Map()); // false

const obj = { a: 1, b: 2, c: 3 };
withProp(obj, "b", 99);     // { a: 1, b: 99, c: 3 }
withProp(obj, "b", 2);      // same ref (value unchanged)
omitProp(obj, "b");         // { a: 1, c: 3 }
pickProps(obj, "a", "c");   // { a: 1, c: 3 }
```

### Strings and numbers

```ts
import {
  isString, getString, requireString, sanitizeText, sanitizeMultilineText,
  simplifyString, getSlug, limitString, splitString, getWords,
  getCurrencyCodes, formatCurrency,
} from "shelving/util";

isString("hi", 1);          // true  (min 1 char)
getString(42);               // "42"
getString(true);             // "true"
getString(new Date(...));    // ISO string

sanitizeText("  Hello\x00  World  "); // "Hello World"
sanitizeMultilineText("line1\r\nline2"); // "line1\nline2"

simplifyString("Héllo Wörld!");   // "hello world"
getSlug("Hello World!");          // "hello-world"

limitString("A long string here", 10); // "A long…"
getWords(`hello "world foo" bar`);     // ["hello", "world foo", "bar"]
getCurrencyCodes().includes("GBP");    // true
formatCurrency(12.34, "GBP");    // "£12.34"
```

### Data objects

```ts
import {
  isData, assertData, getDataProp, splitDataKey, joinDataKey, getXML,
} from "shelving/util";

const doc = { user: { name: "Alice", age: 30 } };

isData(doc);                    // true
isData(new Map());              // false

getDataProp(doc, "user.name");  // "Alice"
getDataProp(doc, ["user", "age"]); // 30

splitDataKey("user.name");      // ["user", "name"]
joinDataKey(["user", "name"]);  // "user.name"
getXML({ user: { name: "Alice" } }); // "<user><name>Alice</name></user>"
```

### Items

```ts
import { getItem, getIdentifier, hasIdentifier } from "shelving/util";

const item = getItem("abc", { name: "Widget", price: 9 });
// { id: "abc", name: "Widget", price: 9 }

getIdentifier(item);           // "abc"
hasIdentifier(item, "abc");    // true
```

### Queries

A `Query<T>` is a plain object whose keys use an encoded syntax to describe filters, ordering, and limits against a set of data items. `getQueryFilters()` and `getQueryOrders()` parse the keys into structured objects; `queryItems()` applies the full query to an iterable.

| Key syntax    | Meaning                         |
| ------------- | ------------------------------- |
| `key`         | field equals value              |
| `!key`        | field does not equal value      |
| `key[]`       | array field contains value      |
| `key>`        | field greater than value        |
| `key>=`       | field greater than or equal     |
| `key<`        | field less than value           |
| `key<=`       | field less than or equal        |
| `$order`      | sort key(s); prefix `!` = desc  |
| `$limit`      | maximum number of results       |

```ts
import { queryItems, getQueryFilters } from "shelving/util";

const items = [
  { id: "1", status: "active", price: 10 },
  { id: "2", status: "inactive", price: 5 },
  { id: "3", status: "active", price: 20 },
];

const query = { status: "active", "price>": 8, $order: "price", $limit: 10 };

const results = Array.from(queryItems(items, query));
// [{ id: "1", ... price: 10 }, { id: "3", ... price: 20 }]
```

Use `getBeforeQuery()` and `getAfterQuery()` for cursor-based pagination.

### Updates

An `Updates<T>` object uses an encoded key syntax to describe mutations to a data object. `updateData()` applies the updates immutably.

| Key syntax  | Action                          |
| ----------- | ------------------------------- |
| `key`       | set field to value              |
| `=key`      | set leaf field (more precise)   |
| `+=key`     | increment number field          |
| `-=key`     | decrement number field          |
| `+[]key`    | push item(s) into array field   |
| `-[]key`    | remove item(s) from array field |

```ts
import { updateData } from "shelving/util";

const doc = { count: 5, tags: ["a", "b"] };

updateData(doc, { "+=count": 3 });         // { count: 8, tags: ["a", "b"] }
updateData(doc, { "+[]tags": "c" });       // { count: 5, tags: ["a", "b", "c"] }
updateData(doc, { "-[]tags": "a" });       // { count: 5, tags: ["b"] }
```

`updateData()` returns the same reference when nothing changed.

### Equality

```ts
import {
  isEqual, isShallowEqual, isDeepEqual,
  isArrayEqual, isObjectEqual, isObjectMatch,
  isInArray, isArrayWith,
} from "shelving/util";

isEqual(1, 1);                          // true  (strict ===)
isShallowEqual({ a: 1 }, { a: 1 });    // true  (shallow props)
isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true (recursive)

isArrayEqual([1, 2], [1, 2]);           // true
isObjectMatch({ a: 1, b: 2 }, { a: 1 }); // true (subset match)

isInArray(["x", "y", "z"], "y");        // true
isArrayWith(["x", "y"], "x");           // true
```

## See also

- [schema](../schema/README.md) — Schema validation built on the `Data` and `Item` types from this module.
- [db](../db/README.md) — Database layer that uses `Query`, `Updates`, and `Item` from this module.

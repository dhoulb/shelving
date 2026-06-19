# test

Shared test fixtures and assertion helpers for Shelving's own unit tests.

This module exists so the test suite has one canonical set of sample data and matchers, instead of redefining ad-hoc `name` / `age` objects in every file. It is internal — not part of the public `shelving` package — but `shelving/test` is importable from test files within the library.

Reach for these fixtures whenever a test needs a schema, a collection, or a handful of realistic items — especially collection, provider, and query tests.

## Fixtures

### Basics

`BASIC_SCHEMA` is a `DataSchema` covering every common field type — string, number, choice, array, boolean, and a nested object. `basic1` … `basic9` are ready-made items. `basics` is those nine in a deliberately unsorted order, so a test that sorts or queries them actually proves something. `basic999` is a tenth item kept out of the array — handy as an "add this" payload.

```ts
import { BASIC_SCHEMA, basics, basic1 } from "shelving/test";

BASIC_SCHEMA.validate(basic1); // Passes.
basics.length;                 // 9, in unsorted order.
```

### People

`PERSON_SCHEMA` is a smaller, more lifelike shape — a nested `name` object and a nullable `birthday`. `person1` … `person5` and the `people` array supply the data.

```ts
import { PERSON_SCHEMA, people } from "shelving/test";
```

### Collections

`BASICS_COLLECTION` and `PEOPLE_COLLECTION` wrap the two schemas as `Collection` definitions, ready to hand straight to a provider.

```ts
import { MemoryDBProvider } from "shelving/db";
import { BASICS_COLLECTION, basic1 } from "shelving/test";

const provider = new MemoryDBProvider();
await provider.addItem(BASICS_COLLECTION, basic1);
```

## Assertion helpers

| Helper | Use |
|---|---|
| `expectOrderedItems()` | Assert an iterable of items has exactly these ids, in this order. |
| `expectUnorderedItems()` | The same, but order does not matter. |
| `EXPECT_PROMISELIKE` | A matcher for "this value looks like a promise". |

`expectOrderedItems()` and `expectUnorderedItems()` compare by `id`, so a failure reports the ids that were wrong — far more readable than a deep object diff. Both trim their own stack frame, so the reported failure points at your test.

```ts
import { expectOrderedItems } from "shelving/test";

const results = await provider.getQuery(BASICS_COLLECTION, { $order: "num" });
expectOrderedItems(results, ["basic1", "basic2", "basic3"]);
```

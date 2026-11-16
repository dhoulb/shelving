# shelving/test

- Kind: module
- Import: `import { … } from "shelving/test";`

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


## Functions

- [testDBProvider()](test/testDBProvider.md): Register the universal DBProvider contract test suite against a provider, so every backend proves the same behaviour.
- [expectUnorderedItems()](test/expectUnorderedItems.md): Assert that a set of Item objects has exactly the expected .id values, in any order.
- [expectOrderedItems()](test/expectOrderedItems.md): Assert that a set of Item objects has exactly the expected .id values, in the exact given order.

## Classes

- [TransactionTestDBProvider](test/TransactionTestDBProvider.md): In-memory provider for testing wrapping providers' transact() — runs the callback directly against itself.

## Interfaces

- [TestDBProviderOptions](test/TestDBProviderOptions.md): Options for testDBProvider(), declaring the capabilities of the provider under test.

## Types

- [BasicData](test/BasicData.md): Validated data shape of a test basic, inferred from BASIC_SCHEMA.
- [BasicItem](test/BasicItem.md): A test basic as a stored Item — BasicData plus a string id.
- [PersonData](test/PersonData.md): Validated data shape of a test person, inferred from PERSON_SCHEMA.
- [PersonItem](test/PersonItem.md): A test person as a stored Item — PersonData plus a string id.

## Constants

- [BASIC_SCHEMA](test/BASIC_SCHEMA.md): Schema for a test "basic" fixture, exercising string, number, choice, array, boolean, and nested-data props.
- [basic1](test/basic1.md): Test basic fixture: str: "aaa", num: 100, group a, odd.
- [basic2](test/basic2.md): Test basic fixture: str: "bbb", num: 200, group a, even.
- [basic3](test/basic3.md): Test basic fixture: str: "ccc", num: 300, group a, odd.
- [basic4](test/basic4.md): Test basic fixture: str: "ddd", num: 400, group b, even.
- [basic5](test/basic5.md): Test basic fixture: str: "eee", num: 500, group b, odd.
- [basic6](test/basic6.md): Test basic fixture: str: "fff", num: 600, group b, even.
- [basic7](test/basic7.md): Test basic fixture: str: "ggg", num: 700, group c, odd.
- [basic8](test/basic8.md): Test basic fixture: str: "hhh", num: 800, group c, even.
- [basic9](test/basic9.md): Test basic fixture: str: "iii", num: 900, group c, odd.
- [basics](test/basics.md): Array of all nine test basic fixtures in a deliberately shuffled order, for exercising sort/query behaviour.
- [basic999](test/basic999.md): Standalone test basic data (no id): str: "zzz", num: 999, for use as new/unsaved data.
- [BASICS_COLLECTION](test/BASICS_COLLECTION.md): Collection of BasicData items keyed by string id, for testing database providers.
- [PERSON_SCHEMA](test/PERSON_SCHEMA.md): Schema for a test "person" fixture, with a nested name and a nullable birthday.
- [person1](test/person1.md): Test person fixture: Dave Brook, born 1985-12-06.
- [person2](test/person2.md): Test person fixture: Sally Callister, born 1973-11-19.
- [person3](test/person3.md): Test person fixture: Sammy Canister, with no birthday (null).
- [person4](test/person4.md): Test person fixture: Jilly Jones, with no birthday (null).
- [person5](test/person5.md): Test person fixture: Terry Times, born 1964-08-01.
- [people](test/people.md): Ordered array of all five test person fixtures (person1 through person5).
- [PEOPLE_COLLECTION](test/PEOPLE_COLLECTION.md): Collection of PersonData items keyed by string id, for testing database providers.
- [EXPECT_PROMISELIKE](test/EXPECT_PROMISELIKE.md): Asymmetric matcher that expects an object matching PromiseLike (i.e. has a .then() method).

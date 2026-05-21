# Dictionary objects

Typed helpers for working with `{ [key: string]: T }` objects — called *dictionaries* to distinguish them from the more permissive `Data` type. Mirrors the naming conventions of the array and object helpers: `with*` for immutable updates, `set*`/`delete*` for mutable by-reference mutations.

- `ImmutableDictionary<T>` and `MutableDictionary<T>` are the two variants; all immutable helpers return the same reference when nothing changed.
- `requireDictionary` converts an iterable of `[key, value]` pairs into a plain object — useful when you receive entries from a `Map` or other iterable source.
- `EMPTY_DICTIONARY` is a prototype-null singleton; use it as a safe empty default.

## Usage

### Type guards and conversion

```ts
import { isDictionary, assertDictionary, requireDictionary } from "shelving/util";

isDictionary({ a: 1 });  // true
isDictionary(new Map()); // false

// Convert an iterable of entries to a dictionary:
requireDictionary([["a", 1], ["b", 2]]); // { a: 1, b: 2 }
requireDictionary({ a: 1 });             // { a: 1 }  (already a dictionary)
```

### Reading items

```ts
import { getDictionaryItem, requireDictionaryItem, isDictionaryItem, getDictionaryItems } from "shelving/util";

const dict = { uk: "London", fr: "Paris" };

getDictionaryItem(dict, "uk");      // "London"
getDictionaryItem(dict, "de");      // undefined
requireDictionaryItem(dict, "uk");  // "London"
requireDictionaryItem(dict, "de");  // throws RequiredError

isDictionaryItem(dict, "fr");       // true
getDictionaryItems(dict);           // [["uk", "London"], ["fr", "Paris"]]
```

### Immutable updates

```ts
import { withDictionaryItem, withDictionaryItems, omitDictionaryItem, omitDictionaryItems, pickDictionaryItems } from "shelving/util";

const dict = { a: 1, b: 2, c: 3 };

withDictionaryItem(dict, "d", 4);            // { a:1, b:2, c:3, d:4 }
withDictionaryItems(dict, { b: 99, d: 4 }); // { a:1, b:99, c:3, d:4 }
omitDictionaryItem(dict, "b");               // { a:1, c:3 }
omitDictionaryItems(dict, "a", "c");         // { b:2 }
pickDictionaryItems(dict, "a", "c");         // { a:1, c:3 }
```

### Mutable updates (by reference)

```ts
import { setDictionaryItem, setDictionaryItems, deleteDictionaryItem, deleteDictionaryItems } from "shelving/util";

const dict: MutableDictionary<number> = { a: 1, b: 2 };

setDictionaryItem(dict, "c", 3);          // dict is now { a:1, b:2, c:3 }
setDictionaryItems(dict, { d: 4 });       // dict is now { a:1, b:2, c:3, d:4 }
deleteDictionaryItem(dict, "a");          // dict is now { b:2, c:3, d:4 }
deleteDictionaryItems(dict, "b", "c");    // dict is now { d:4 }
```

## See also

- [util](/util) — full util module overview
- [data](/util/data) — `Data` type, a close relative for untyped-value plain objects

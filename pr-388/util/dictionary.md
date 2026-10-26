# shelving/util/dictionary

- Kind: module
- Import: `import { … } from "shelving/util/dictionary";`

Typed helpers for working with `{ [key: string]: T }` objects — called *dictionaries* to distinguish them from the more permissive `Data` type. Mirrors the naming conventions of the array and object helpers: `with*` for immutable updates, `set*`/`delete*` for mutable by-reference mutations.

- `ImmutableDictionary<T>` and `MutableDictionary<T>` are the two variants; all immutable helpers return the same reference when nothing changed.
- `requireDictionary()` converts an iterable of `[key, value]` pairs into a plain object — useful when you receive entries from a `Map` or other iterable source.
- `EMPTY_DICTIONARY` is a prototype-null singleton; use it as a safe empty default.
- `setDictionaryItem()` / `setDictionaryItems()` trust their keys by contract: a runtime-untrusted key like `__proto__` would mutate the target's prototype, so validate or filter untrusted keys first (or use a null-prototype target).

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


## Functions

- [isDictionary](dictionary/isDictionary.md): Is an unknown value a dictionary object?
- [assertDictionary](dictionary/assertDictionary.md): Assert that an unknown value is a dictionary object.
- [requireDictionary](dictionary/requireDictionary.md): Convert a possible dictionary into a dictionary.
- [getDictionaryItems](dictionary/getDictionaryItems.md): Turn a dictionary object into a set of props.
- [isDictionaryItem](dictionary/isDictionaryItem.md): Is an unknown value the key for an own prop of a dictionary.
- [assertDictionaryItem](dictionary/assertDictionaryItem.md): Assert that an unknown value is the key for an own prop of a dictionary.
- [requireDictionaryItem](dictionary/requireDictionaryItem.md): Get an item in a dictionary object, or throw RequiredError if it doesn't exist.
- [getDictionaryItem](dictionary/getDictionaryItem.md): Get an item in a dictionary object, or undefined if it doesn't exist.

## Types

- [ImmutableDictionary](dictionary/ImmutableDictionary.md): Readonly dictionary object.
- [MutableDictionary](dictionary/MutableDictionary.md): Writable dictionary object.
- [DictionaryItem](dictionary/DictionaryItem.md): Single item for a dictionary object in entry format.
- [DictionaryValue](dictionary/DictionaryValue.md): Get the type of the values of the items of a dictionary object.
- [PossibleDictionary](dictionary/PossibleDictionary.md): Value that can be converted to a dictionary object.
- [EmptyDictionary](dictionary/EmptyDictionary.md): Type that represents an empty dictionary object.

## Constants

- [withDictionaryItem](dictionary/withDictionaryItem.md): Set an item on a dictionary object (immutably) and return a new object including that item.
- [withDictionaryItems](dictionary/withDictionaryItems.md): Set several items on a dictionary object (immutably) and return a new object including those items.
- [omitDictionaryItems](dictionary/omitDictionaryItems.md): Remove several items from a dictionary object (immutably) and return a new object without those items.
- [omitDictionaryItem](dictionary/omitDictionaryItem.md): Remove an item from a dictionary object (immutably) and return a new object without that item.
- [pickDictionaryItems](dictionary/pickDictionaryItems.md): Pick several items from a dictionary object and return a new object with only those items.
- [setDictionaryItem](dictionary/setDictionaryItem.md): Set a single named item on a dictionary object (by reference) and return its value.
- [setDictionaryItems](dictionary/setDictionaryItems.md): Set several named items on a dictionary object (by reference).
- [deleteDictionaryItems](dictionary/deleteDictionaryItems.md): Remove several key/value entries from a dictionary object (by reference).
- [deleteDictionaryItem](dictionary/deleteDictionaryItem.md): Remove a key/value entry from a dictionary object (by reference).
- [EMPTY_DICTIONARY](dictionary/EMPTY_DICTIONARY.md): An empty dictionary object.

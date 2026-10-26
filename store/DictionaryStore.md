# DictionaryStore

- Kind: class
- Import: `import { DictionaryStore } from "shelving/store";`
- Extends: `BusyStore<ImmutableDictionary<T>, PossibleDictionary<T>>`
- Implements: `Iterable<DictionaryItem<T>>`

Store a dictionary object (string-keyed map of values), with helpers to read and mutate its entries.
- Accepts any `PossibleDictionary<T>` as input and normalises it to an `ImmutableDictionary<T>`.
- Mutations replace the stored dictionary with an immutable updated copy.
- Iterable, yielding `[key, value]` entry tuples.

A `Store` for a string-keyed object (a dictionary). `DictionaryStore<T>` defaults to an empty object and adds entry-level helpers — each mutation produces a new object so consumers see a genuine change.

## Usage

```ts
import { DictionaryStore } from "shelving/store";

const prices = new DictionaryStore<number>({ apple: 1 });

prices.set("banana", 2);          // { apple: 1, banana: 2 }
prices.update({ apple: 3 });      // { apple: 3, banana: 2 }
prices.delete("banana");          // { apple: 3 }

console.log(prices.get("apple")); // 3
console.log(prices.count);        // 1

for (const [key, value] of prices) console.log(key, value); // iterable over entries
```


## Signatures

```ts
new DictionaryStore<T>(value: PossibleDictionary<T> = EMPTY_DICTIONARY)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDictionary<T>` | Defaults to `EMPTY_DICTIONARY`. |

## Returns

| Type | Description |
| --- | --- |
| `DictionaryStore<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `count` | `number` | Get the number of entries in the current value of this store. Read only. |

## Methods

- [update](DictionaryStore/update.md): Update several entries in this dictionary.
- [deleteItems](DictionaryStore/deleteItems.md): Remove one or more named entries from this dictionary.
- [get](DictionaryStore/get.md): Get a single named item from this dictionary, or undefined if it is not set.
- [set](DictionaryStore/set.md): Set a single named item in this dictionary.
- [delete](DictionaryStore/delete.md): Delete one or more named items from this dictionary.

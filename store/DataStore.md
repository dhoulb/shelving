# DataStore

- Kind: class
- Import: `import { DataStore } from "shelving/store";`
- Extends: `BusyStore<T>`

Store a data object, with helpers to read and update individual props.
- `update()`, `set()` replace the stored object with an immutable updated copy.

A `Store` for a plain object value. `DataStore<T>` adds object-aware helpers on top of the base store: read the whole object with `.data`, or update it without replacing the reference yourself.

`OptionalDataStore<T>` is the variant whose value may be `undefined` — it adds `.exists`, `.require()`, and `.delete()` for the absent case.

## Usage

### `DataStore`

```ts
import { DataStore } from "shelving/store";

const state = new DataStore<{ name: string; count: number }>({ name: "Dave", count: 0 });

state.update({ count: 1 });   // Partial update — merges into the current value.
state.set("count", 2);        // Set a single named prop.
console.log(state.get("name")); // "Dave"
console.log(state.data);        // { name: "Dave", count: 2 }
```

### `OptionalDataStore`

```ts
import { OptionalDataStore, NONE } from "shelving/store";

const profile = new OptionalDataStore<{ name: string }>(NONE);

profile.value = { name: "Dave" };
console.log(profile.exists);        // true
console.log(profile.require().name); // "Dave" — throws RequiredError if absent
profile.delete();                    // value is now undefined
```


## Signatures

```ts
new DataStore<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `DataStore<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `T` | Get the current data of this store. - Supports suspense-like reads: throws a `Promise` while loading or the error `reason` on failure (inherited from `Store.value`). |

## Methods

- [update](DataStore/update.md): Update several props in this data.
- [get](DataStore/get.md): Get a single named prop from this data.
- [set](DataStore/set.md): Set a single named prop in this data.

# DataStore

A [`Store`](/store/Store) for a plain object value. `DataStore<T>` adds object-aware helpers on top of the base store: read the whole object with `.data`, or update it without replacing the reference yourself.

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

## See also

- [`Store`](/store/Store) — the base class.
- [`shelving/store`](/store) — overview of all store classes.

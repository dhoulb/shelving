# BusyStore

A [`Store`](/store/Store) that tracks whether it is currently awaiting a new value. `BusyStore<T>` exposes a `.busy` boolean store that becomes `true` when the store starts awaiting an async value and `false` once that value (or an error) arrives.

`BusyStore` is the base class for [`DataStore`](/store/DataStore), [`ArrayStore`](/store/ArrayStore), [`DictionaryStore`](/store/DictionaryStore), and [`FetchStore`](/store/FetchStore) — anything that may resolve a value asynchronously.

## Usage

`.busy` is itself a [`BooleanStore`](/store/BooleanStore), so you can read it or iterate it like any store — useful for driving a loading spinner that is separate from the store's own value:

```ts
import { BusyStore, NONE } from "shelving/store";

const store = new BusyStore<number>(NONE);

store.value = fetchNextValue(); // assigning a promise — store.busy becomes true

for await (const busy of store.busy) {
  console.log(busy ? "loading…" : "idle");
}
```

## See also

- [`Store`](/store/Store) — the base class.
- [`FetchStore`](/store/FetchStore) — extends `BusyStore` with callback-driven fetching.
- [`shelving/store`](/store) — overview of all store classes.

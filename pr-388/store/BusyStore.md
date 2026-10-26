# BusyStore

- Kind: class
- Import: `import { BusyStore } from "shelving/store";`
- Extends: `Store<T, TT>`

Store that tracks its busy status via a separate `this.busy` store.
- "busy" means the store is awaiting a new (async) value.
- `this.busy` becomes `true` when `await()` starts and `false` when `abort()` is called (which also happens whenever a value or `reason` is set).

A `Store` that tracks whether it is currently awaiting a new value. `BusyStore<T>` exposes a `.busy` boolean store that becomes `true` when the store starts awaiting an async value and `false` once that value (or an error) arrives.

`BusyStore` is the base class for `DataStore`, `ArrayStore`, `DictionaryStore`, and `FetchStore` — anything that may resolve a value asynchronously.

## Usage

`.busy` is itself a `BooleanStore`, so you can read it or iterate it like any store — useful for driving a loading spinner that is separate from the store's own value:

```ts
import { BusyStore, NONE } from "shelving/store";

const store = new BusyStore<number>(NONE);

store.value = fetchNextValue(); // assigning a promise — store.busy becomes true

for await (const busy of store.busy) {
  console.log(busy ? "loading…" : "idle");
}
```


## Signatures

```ts
new BusyStore<T, TT>()
```

## Returns

| Type | Description |
| --- | --- |
| `BusyStore<T, TT>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `busy` | `unknown` | Boolean store that is `true` while this store is awaiting a new value. Read only. Defaults to `new BooleanStore(false)`. |

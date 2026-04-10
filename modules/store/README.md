# store

Observable value containers for reactive state. A `Store<T>` holds a single current value, broadcasts changes to all active consumers, and integrates with React Suspense out of the box. Stores suppress duplicate emissions using deep equality, so consumers only see genuine changes.

## Concepts

**Loading state** — a store starts in a loading state represented internally by the `NONE` sentinel. Reading `store.value` while loading throws a `Promise` (the store's internal `DeferredSequence`), which React Suspense catches and waits on. Reading `store.loading` is safe and never throws.

**Error state** — setting `store.reason` puts the store in an error state. Subsequent reads of `store.value` throw that reason, which React error boundaries can catch.

**Async iteration** — `Store<T>` implements `AsyncIterable<T>`. Iterating with `for await...of` first emits the current value (if one exists), then emits each subsequent value as it changes. The iterator blocks between values using the store's internal [`DeferredSequence`](../sequence/README.md).

**Duplicate suppression** — deep equality is checked before emitting. Setting the same value twice only triggers one emission.

**Starters** — `store.starter` accepts a function that runs when the store has at least one active iterator and stops when none remain. Use this to wire up external subscriptions (e.g. a database realtime feed) that should only be active while something is listening.

**Subclasses**

| Class | Description |
|---|---|
| `DataStore<T>` | Adds `.data`, `.update()`, `.get()`, `.set()` helpers for object values. |
| `OptionalDataStore<T>` | Like `DataStore` but the value may be `undefined`; `.exists` and `.require()` handle the absent case. |
| `ArrayStore<T>` | Stores an array; adds `.first`, `.last`, `.count`, `.add()`, `.delete()`, `.toggle()`. |
| `BooleanStore` | Stores a boolean; adds `.toggle()`. |

`ItemStore` and `QueryStore` in the [`db`](../db/README.md) module extend `OptionalDataStore` and `ArrayStore` respectively, adding database-aware refresh and subscription logic.

## Usage

### Create and update a store

```ts
import { Store, NONE } from "shelving/store";

// Start loading (no value yet).
const store = new Store<number>(NONE);

// Provide a value — any waiting iterators are unblocked.
store.value = 42;

// Update again.
store.value = 43;
```

### Iterate over changes

```ts
for await (const v of store) {
  console.log(v); // receives 42, then 43, then any future values
}
```

### Check state safely

```ts
if (store.loading) {
  // No value yet — safe to check without risk of throwing.
} else {
  console.log(store.value);
}
```

### Starter — run code only while subscribed

```ts
import { DataStore, NONE } from "shelving/store";

const store = new DataStore<{ count: number }>(NONE);

// The function runs when the first `for await` begins, and stops when the last one ends.
store.starter = () => {
  const id = setInterval(() => {
    store.value = { count: Date.now() };
  }, 1000);
  return () => clearInterval(id);
};
```

### Pipe from an async iterable

`store.through(sequence)` is an async generator that sets the store's value for each item yielded by `sequence` and re-yields it. This is the bridge between any `AsyncIterable` source and a `Store`.

```ts
async function connect(stream: AsyncIterable<number>) {
  for await (const _ of store.through(stream)) {
    // store.value is updated on each iteration
  }
}
```

## See also

- [`sequence`](../sequence/README.md) — `DeferredSequence` that powers the store's async iteration
- [`db`](../db/README.md) — `ItemStore` and `QueryStore` extend `Store` for database-backed reactive state

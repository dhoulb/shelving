# Store

The base observable value container. A `Store<T>` holds one current value, broadcasts changes to every active consumer, and suppresses duplicate emissions using deep equality. It is the class `useStore()` subscribes to and the base every other store extends.

A store starts in a loading state (pass the `NONE` sentinel) or with an initial value. Reading `.value` while loading throws a `Promise`; reading `.loading` is always safe.

## Usage

### Create and update

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

Iterating emits the current value first (if one exists), then each subsequent value:

```ts
for await (const v of store) {
  console.log(v); // 43, then any future values
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

`store.starter` accepts a function that runs when the first `for await` begins and stops when the last one ends. Use it to wire up external subscriptions that should only be active while something is listening:

```ts
store.starter = () => {
  const id = setInterval(() => { store.value = Date.now(); }, 1000);
  return () => clearInterval(id);
};
```

### Pipe from an async iterable

`store.through(sequence)` is an async generator that sets the store's value for each item yielded by `sequence` and re-yields it — the bridge between any `AsyncIterable` source and a store:

```ts
for await (const _ of store.through(someStream)) {
  // store.value is updated on each iteration
}
```

## See also

- [sequence](/sequence) — `DeferredSequence` that powers the store's iteration.
- [store](/store) — overview of all store classes.

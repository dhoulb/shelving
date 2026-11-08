# Store

- Kind: class
- Import: `import { Store } from "shelving/store";`
- Implements: `AsyncIterable<T, void, void>`, `AsyncDisposable`

Store that retains its most recent value and is async-iterable to allow values to be observed.
- Current value can be read at `store.value` and `store.data`
- Stores also send their most-recent value to any new subscribers immediately when a new subscriber is added.
- Stores can also be in a loading state where they do not have a current value.
- Duplicate emissions are suppressed — writing a value equal to the current one is a no-op.
- Uses the `NONE` sentinel internally to represent the loading state.

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


## Signatures

```ts
new Store<T, TT>(value: StoreInternal<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `StoreInternal<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `Store<T, TT>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `next` | `unknown` | Deferred sequence this store uses to issue values as they change. Read only. Defaults to `new DeferredSequence<T>()`. |
| `snapshot` | `unknown` | Snapshot returns either the current reason or the current value (or `NONE` if reason is unset). - Unlike `this.value` this never throws, so it's safe for `useSyncExternalStore()`-style polling. Read only. |
| `loading` | `boolean` | Store is considered to be "loading" if it has no value or error. - Calling `this.value` will throw `this.reason` if there's an error reason set, or a `Promise` if there's no value set. - Calling `this.loading` is a way to check if this store has a value without triggering those throws. Read only. |
| `value` | `T` | Set the value of this store. - Sets any sync values. - Awaits any async values. - Setting value the `NONE` symbol indicates the store has no value so should be in a "loading" state. - Setting value to `SKIP` indicates the value should be silently ignored (sometimes it's helpful to have a way to skip a write entirely). - Setting value to the same as the existing value is a no-op (duplicate emissions are suppressed). - If this store has any pending `await()` calls they are aborted and their results are silently discarded. |
| `time` | `number \| undefined` | Time (in milliseconds) this store was last updated with a new value. - Will be `undefined` if the value is still loading. Read only. |
| `age` | `number` | How old this store's value is (in milliseconds). - Will be `Infinity` if the value is still loading (to simplify downstream calculations). Read only. |
| `reason` | `unknown` | Current error of this store, or `undefined` if there is no error. |

## Methods

- [Store.write()](Store/write.md): Write a synchronous value to this store.
- [Store.read()](Store/read.md): Called to read values. Can be used to override get behaviour.
- [Store.stale()](Store/stale.md): Whether this store is stale based on a maxAge value in milliseconds.
- [Store.through()](Store/through.md): Set the value of this store as values are pulled from a sequence.
- [Store.call()](Store/call.md): Call a callback and save the returned value to this store.
- [Store.reduce()](Store/reduce.md): Send the current value to a callback and save the returned value to this store.
- [Store.run()](Store/run.md): Run a callback and ignore any returned value.
- [Store.send()](Store/send.md): Send the current value to a callback and ignore any returned value.
- [Store.await()](Store/await.md): Await an async value and save it to this store.
- [Store.abort()](Store/abort.md): Abort any current pending await() call.
- [Store.subscribe()](Store/subscribe.md): Subscribe to this store with handlers.

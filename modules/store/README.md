# store

Observable value containers for reactive state. A `Store<T>` holds a single current value, broadcasts changes to all active consumers, and integrates with React Suspense out of the box. Stores suppress duplicate emissions using deep equality, so consumers only see genuine changes.

## Concepts

**Loading state** — a store starts in a loading state represented internally by the `NONE` sentinel. Reading `Store.value` while loading throws a `Promise` (the store's internal `DeferredSequence`), which React Suspense catches and waits on. Reading `Store.loading` is safe and never throws.

**Error state** — setting `Store.reason` puts the store in an error state. Subsequent reads of `.value` throw that reason, which React error boundaries can catch.

**Async iteration** — `Store<T>` implements `AsyncIterable<T>`. Iterating with `for await...of` first emits the current value (if one exists), then emits each subsequent value as it changes. The iterator blocks between values using the store's internal `DeferredSequence`.

**Duplicate suppression** — deep equality is checked before emitting. Setting the same value twice only triggers one emission.

**Starters** — `store.starter` accepts a function that runs when the store has at least one active iterator and stops when none remain. Use this to wire up external subscriptions (e.g. a database realtime feed) that should only be active while something is listening.

**Subclasses**

| Class | Description |
|---|---|
| `DataStore<T>` | Adds `DataStore.data`, `DataStore.update()`, `DataStore.get()`, `DataStore.set()` helpers for object values. |
| `OptionalDataStore<T>` | Like `DataStore` but the value may be `undefined`; `OptionalDataStore.exists` and `OptionalDataStore.require()` handle the absent case. |
| `ArrayStore<T>` | Stores an array; adds `ArrayStore.first`, `ArrayStore.last`, `ArrayStore.count`, `ArrayStore.add()`, `ArrayStore.delete()`, `ArrayStore.toggle()`. |
| `DictionaryStore<T>` | Stores a string-keyed object; adds `DictionaryStore.get()`, `DictionaryStore.set()`, `DictionaryStore.delete()`, `DictionaryStore.update()`. |
| `BooleanStore` | Stores a boolean; adds `BooleanStore.toggle()`. |
| `PathStore` | Stores an absolute path; adds `PathStore.isActive()` / `PathStore.isProud()` route helpers. |
| `URLStore` | Stores a URL; adds query-param helpers and `URLStore.isActive()` / `URLStore.isProud()`. |
| `BusyStore<T>` | Adds a `BusyStore.busy` boolean store that is `true` while awaiting a value. |
| `FetchStore<T>` | Fetches its value from a callback; adds `FetchStore.refresh()` / `FetchStore.invalidate()`. |
| `PayloadFetchStore<P, R>` | A `FetchStore` driven by a `PayloadFetchStore.payload` store — changing the payload re-fetches. |

`ItemStore` and `QueryStore` in the `shelving/db` module extend `FetchStore` directly, adding database-aware fetch and subscription logic.

## Usage

Every store shares the same core: set `.value`, read it back (or `for await` it), and consumers see the change. The base `Store` page covers the full lifecycle; each subclass page covers its own helpers.

As an integration example, `Store.through()` bridges any `AsyncIterable` source into a store — it sets the store's value for each item yielded and re-yields it:

```ts
import { Store, NONE } from "shelving/store";

const store = new Store<number>(NONE);

async function connect(stream: AsyncIterable<number>) {
  for await (const _ of store.through(stream)) {
    // store.value is updated on each iteration; any consumers re-render
  }
}
```

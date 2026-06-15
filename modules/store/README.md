# store

Observable value containers for reactive state. A [`Store`](/store/Store)`<T>` holds a single current value, broadcasts changes to all active consumers, and integrates with React Suspense out of the box. Stores suppress duplicate emissions using deep equality, so consumers only see genuine changes.

## Concepts

**Loading state** — a store starts in a loading state represented internally by the [`NONE`](/util/constants/NONE) sentinel. Reading [`.value`](/store/Store/value) while loading throws a `Promise` (the store's internal [`DeferredSequence`](/sequence/DeferredSequence)), which React Suspense catches and waits on. Reading [`.loading`](/store/Store/loading) is safe and never throws.

**Error state** — setting [`.reason`](/store/Store/reason) puts the store in an error state. Subsequent reads of `.value` throw that reason, which React error boundaries can catch.

**Async iteration** — `Store<T>` implements `AsyncIterable<T>`. Iterating with `for await...of` first emits the current value (if one exists), then emits each subsequent value as it changes. The iterator blocks between values using the store's internal `DeferredSequence`.

**Duplicate suppression** — deep equality is checked before emitting. Setting the same value twice only triggers one emission.

**Starters** — `store.starter` accepts a function that runs when the store has at least one active iterator and stops when none remain. Use this to wire up external subscriptions (e.g. a database realtime feed) that should only be active while something is listening.

**Subclasses**

| Class | Description |
|---|---|
| [`DataStore`](/store/DataStore)`<T>` | Adds [`.data`](/store/DataStore/data), [`.update()`](/store/DataStore/update), [`.get()`](/store/DataStore/get), [`.set()`](/store/DataStore/set) helpers for object values. |
| [`OptionalDataStore`](/store/OptionalDataStore)`<T>` | Like `DataStore` but the value may be `undefined`; [`.exists`](/store/OptionalDataStore/exists) and [`.require()`](/store/OptionalDataStore/require) handle the absent case. |
| [`ArrayStore`](/store/ArrayStore)`<T>` | Stores an array; adds [`.first`](/store/ArrayStore/first), [`.last`](/store/ArrayStore/last), [`.count`](/store/ArrayStore/count), [`.add()`](/store/ArrayStore/add), [`.delete()`](/store/ArrayStore/delete), [`.toggle()`](/store/ArrayStore/toggle). |
| [`DictionaryStore`](/store/DictionaryStore)`<T>` | Stores a string-keyed object; adds [`.get()`](/store/DictionaryStore/get), [`.set()`](/store/DictionaryStore/set), [`.delete()`](/store/DictionaryStore/delete), [`.update()`](/store/DictionaryStore/update). |
| [`BooleanStore`](/store/BooleanStore) | Stores a boolean; adds [`.toggle()`](/store/BooleanStore/toggle). |
| [`PathStore`](/store/PathStore) | Stores an absolute path; adds [`.isActive()`](/store/PathStore/isActive) / [`.isProud()`](/store/PathStore/isProud) route helpers. |
| [`URLStore`](/store/URLStore) | Stores a URL; adds query-param helpers and [`.isActive()`](/store/URLStore/isActive) / [`.isProud()`](/store/URLStore/isProud). |
| [`BusyStore`](/store/BusyStore)`<T>` | Adds a [`.busy`](/store/BusyStore/busy) boolean store that is `true` while awaiting a value. |
| [`FetchStore`](/store/FetchStore)`<T>` | Fetches its value from a callback; adds [`.refresh()`](/store/FetchStore/refresh) / [`.invalidate()`](/store/FetchStore/invalidate). |
| [`PayloadFetchStore`](/store/PayloadFetchStore)`<P, R>` | A `FetchStore` driven by a [`.payload`](/store/PayloadFetchStore/payload) store — changing the payload re-fetches. |

[`ItemStore`](/db/ItemStore) and [`QueryStore`](/db/QueryStore) in the [`db`](/db) module extend `FetchStore` directly, adding database-aware fetch and subscription logic.

## Usage

Every store shares the same core: set `.value`, read it back (or `for await` it), and consumers see the change. The base [`Store`](/store/Store) page covers the full lifecycle; each subclass page covers its own helpers.

As an integration example, [`.through()`](/store/Store/through) bridges any `AsyncIterable` source into a store — it sets the store's value for each item yielded and re-yields it:

```ts
import { Store, NONE } from "shelving/store";

const store = new Store<number>(NONE);

async function connect(stream: AsyncIterable<number>) {
  for await (const _ of store.through(stream)) {
    // store.value is updated on each iteration; any consumers re-render
  }
}
```

## See also

- [`sequence`](/sequence) — [`DeferredSequence`](/sequence/DeferredSequence) that powers the store's async iteration
- [`db`](/db) — [`ItemStore`](/db/ItemStore) and [`QueryStore`](/db/QueryStore) extend `Store` for database-backed reactive state
- [`react`](/react) — [`useStore()`](/react/useStore) subscribes a React component to a store

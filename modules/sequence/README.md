# sequence

Async-iterator primitives used throughout the shelving library. A "sequence" is an `AsyncIterable<T>` — something you can consume with `for await...of`. This module provides the building blocks for producing and connecting sequences, most importantly `DeferredSequence`, which lets external code drive an async iterator by resolving or rejecting it on demand.

## Concepts

**`Sequence`** is the abstract base class for every sequence type. It implements `AsyncIterator`, `AsyncIterable`, and `AsyncDisposable` at once, so a single object can be iterated, passed around as an iterable, and disposed. Subclasses implement `next()`.

**`DeferredSequence`** is a sequence you push values into: call `resolve(value)` to publish the next value, `reject(reason)` to publish an error, or `done()` to end iteration. It is also a `Promise`, so you can `await` it to get just the next value. Multiple concurrent iterators all advance together when it resolves.

**`ThroughSequence`** wraps a source `AsyncIterator` and presents it as a full `Sequence` — useful for turning a bare iterator into a reusable iterable and guaranteeing `return()` / `throw()` are present.

**`LazySequence`** is a `ThroughSequence` paired with a `StartCallback` / `StopCallback`. The start callback runs when the first iterator begins iterating and is torn down when the last one finishes — the sequence equivalent of an observable subscription.

**`InspectSequence`** is a `ThroughSequence` that records what passed through it — `first`, `last`, `count`, `done`, and `returned` — without changing the values.

Most application code interacts with sequences indirectly via [`Store`](/store), which uses `DeferredSequence` internally. Use the sequence primitives directly only when building new reactive data sources.

## Usage

The per-class pages carry the detailed usage. As an integration example, wrapping a `DeferredSequence` in a `LazySequence` gives a producer that only runs while something is listening:

```ts
import { DeferredSequence, LazySequence } from "shelving/sequence";

const deferred = new DeferredSequence<number>();

// The interval starts on the first `for await` and stops when the last one ends.
const clock = new LazySequence(deferred, () => {
  const id = setInterval(() => deferred.resolve(Date.now()), 1000);
  return () => clearInterval(id);
});

for await (const ts of clock) {
  console.log(ts); // a timestamp every second, only while iterating
}
```

## See also

- [`Store`](/store) — observable value container built on `DeferredSequence`
- [`db`](/db) — database providers that expose `AsyncIterable` via `getItemSequence` / `getQuerySequence`

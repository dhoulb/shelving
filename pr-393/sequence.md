# shelving/sequence

- Kind: module
- Import: `import { … } from "shelving/sequence";`

Async-iterator primitives used throughout the shelving library. A "sequence" is an `AsyncIterable<T>` — something you can consume with `for await...of`. This module provides the building blocks for producing and connecting sequences, most importantly `DeferredSequence`, which lets external code drive an async iterator by resolving or rejecting it on demand.

## Concepts

**`Sequence`** is the abstract base class for every sequence type. It implements `AsyncIterator`, `AsyncIterable`, and `AsyncDisposable` at once, so a single object can be iterated, passed around as an iterable, and disposed. Subclasses implement `Sequence.next()`.

**`DeferredSequence`** is a sequence you push values into: call `DeferredSequence.resolve()` to publish the next value, `DeferredSequence.reject()` to publish an error, or `DeferredSequence.done()` to end iteration. It is also a `Promise`, so you can `await` it to get just the next value. Multiple concurrent iterators all advance together when it resolves.

**`ThroughSequence`** wraps a source `AsyncIterator` and presents it as a full `Sequence` — useful for turning a bare iterator into a reusable iterable and guaranteeing `Sequence.return()` / `Sequence.throw()` are present.

**`LazySequence`** is a `ThroughSequence` paired with a `StartCallback` / `StopCallback`. The start callback runs when the first iterator begins iterating and is torn down when the last one finishes — the sequence equivalent of an observable subscription.

**`InspectSequence`** is a `ThroughSequence` that records what passed through it — `InspectSequence.first`, `InspectSequence.last`, `InspectSequence.count`, `InspectSequence.done`, and `InspectSequence.returned` — without changing the values.

Most application code interacts with sequences indirectly via `Store`, which uses `DeferredSequence` internally. Use the sequence primitives directly only when building new reactive data sources.

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


## Classes

- [DeferredSequence](sequence/DeferredSequence.md): Deferred sequence of values that can be async iterated and new values can be published.
- [InspectSequence](sequence/InspectSequence.md): Sequence of values that inspects a source sequence of values as it iterates.
- [LazySequence](sequence/LazySequence.md): Sequence of values that calls a StartCallback when it has iterators that are iterating, and calls the corresponding StopCallback when all iterators have finished.
- [Sequence](sequence/Sequence.md): Sequence of values designed to be extended that implements the full async generator protocol.
- [ThroughSequence](sequence/ThroughSequence.md): Async iterable that pulls values from a source async iterable.

## Types

- [DeferredErrorResult](sequence/DeferredErrorResult.md): Result representing a rejection in a DeferredSequence, carrying the thrown reason.
- [DeferredResult](sequence/DeferredResult.md): Pending result of a DeferredSequence — either a standard IteratorResult or a DeferredErrorResult rejection.

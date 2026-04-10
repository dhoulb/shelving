# sequence

Async-iterator primitives used throughout the shelving library. A "sequence" is an `AsyncIterable<T>` — something you can consume with `for await...of`. This module provides the building blocks for producing and connecting sequences, most importantly `DeferredSequence`, which lets external code drive an async iterator by resolving or rejecting it on demand.

## Concepts

**AbstractSequence** is the base class for all sequence types. It implements both `AsyncIterator<T>` and `AsyncIterable<T>` so a single object can be both iterated and passed around as an iterable.

**DeferredSequence** is a sequence that is also a `Promise`. It holds an internal deferred promise that advances the iterator each time `resolve(value)` is called. Calling `reject(reason)` terminates all current consumers with an error. Calling `cancel()` discards any queued resolution without advancing iterators. Multiple concurrent iterators all advance together when the deferred resolves.

**LazyDeferredSequence** wraps a `DeferredSequence` with a `StartCallback`/`StopCallback` pair. The callback runs when the first iterator begins iterating and is torn down when the last one finishes — the sequence equivalent of an observable subscription.

**ThroughSequence** and **IteratorSequence** are thin adapters for piping values between sequences.

Most application code interacts with sequences indirectly via [`Store`](../store/README.md), which uses `DeferredSequence` internally. Use the sequence primitives directly only when building new reactive data sources.

## Usage

### Basic publish/subscribe

```ts
import { DeferredSequence } from "shelving/sequence";

const seq = new DeferredSequence<string>();

// Produce values from anywhere:
setInterval(() => seq.resolve("ping"), 1000);

// Consume in one or more places simultaneously:
for await (const msg of seq) {
  console.log(msg); // "ping" every second
}
```

### Lazy subscription

`LazyDeferredSequence` starts work only when something is actually iterating, and cleans up automatically when all consumers stop.

```ts
import { LazyDeferredSequence } from "shelving/sequence";

const seq = new LazyDeferredSequence<number>(deferred => {
  const id = setInterval(() => deferred.resolve(Date.now()), 500);
  return () => clearInterval(id); // StopCallback — runs when all iterators finish
});

for await (const ts of seq) {
  console.log(ts);
}
```

### Awaiting the next value

Because `DeferredSequence` also implements `Promise`, you can `await` it directly to get the next single value without setting up a full loop:

```ts
const next = await seq; // waits for the next resolve()
```

## See also

- [`Store`](../store/README.md) — observable value container built on `DeferredSequence`
- [`DB`](../db/README.md) — database providers that expose `AsyncIterable` via `getItemSequence` / `getQuerySequence`

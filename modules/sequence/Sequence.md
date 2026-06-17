# Sequence

The abstract base class for every sequence type. `Sequence<T, R, N>` implements `AsyncIterator`, `AsyncIterable`, and `AsyncDisposable` at once, so a single object can be iterated with `for await...of`, passed around as an iterable, and disposed with `await using`.

Unlike a generator, a `Sequence` places no one-shot constraint on iteration — throwing does not permanently end it. Subclasses implement the abstract `next()` method; `return()` and `throw()` have generator-like defaults that subclasses can override for cleanup.

## Usage

`Sequence` is not used directly — extend it, or use a built-in subclass ([`DeferredSequence`](/sequence/DeferredSequence), [`ThroughSequence`](/sequence/ThroughSequence), [`LazySequence`](/sequence/LazySequence), [`InspectSequence`](/sequence/InspectSequence)). A minimal subclass only needs `next()`:

```ts
import { Sequence } from "shelving/sequence";

class CountdownSequence extends Sequence<number, void, void> {
  constructor(private n: number) { super(); }
  async next() {
    return this.n > 0
      ? { done: false as const, value: this.n-- }
      : { done: true as const, value: undefined };
  }
}
```

## See also

- [`DeferredSequence`](/sequence/DeferredSequence) — a sequence you publish values into.
- [sequence](/sequence) — overview of all sequence primitives.

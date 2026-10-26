# Sequence

- Kind: class
- Import: `import { Sequence } from "shelving/sequence";`
- Implements: `AsyncIterable<T, R | undefined, N | undefined>`, `AsyncIterator<T, R | undefined, N | undefined>`, `AsyncDisposable`

Sequence of values designed to be extended that implements the full async generator protocol.

Note: while this class implements the iterator protocol, it is not a _generator_.
- Generators place additional constraints on the operation of an iterator.
- Key constraint is that a generator only runs one time through and keeps track of its status.
- This means when a generator throws, further requests to `next()` will always return `done: true`
- This class does not provide that guarantee or have that constraint.

The abstract base class for every sequence type. `Sequence<T, R, N>` implements `AsyncIterator`, `AsyncIterable`, and `AsyncDisposable` at once, so a single object can be iterated with `for await...of`, passed around as an iterable, and disposed with `await using`.

Unlike a generator, a `Sequence` places no one-shot constraint on iteration — throwing does not permanently end it. Subclasses implement the abstract `next()` method; `return()` and `throw()` have generator-like defaults that subclasses can override for cleanup.

## Usage

`Sequence` is not used directly — extend it, or use a built-in subclass (`DeferredSequence`, `ThroughSequence`, `LazySequence`, `InspectSequence`). A minimal subclass only needs `next()`:

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


## Signatures

```ts
new Sequence<T, R, N>()
```

## Returns

| Type | Description |
| --- | --- |
| `Sequence<T, R, N>` |  |

## Methods

- [next](Sequence/next.md): Get a next value from this async iterator.
- [return](Sequence/return.md): Finish iteration and optionally provide the iterator's final return value.
- [throw](Sequence/throw.md): Throw an error into this iterator.

# ThroughSequence

Wraps a source `AsyncIterator` and presents it as a full `Sequence`. Use it to turn a bare async iterator into a reusable `AsyncIterable`, and to guarantee `return()` and `throw()` are always available — delegating to the source when it provides them.

`ThroughSequence` is the base class for [`LazySequence`](/sequence/LazySequence) and [`InspectSequence`](/sequence/InspectSequence), which add behaviour on top of the pass-through.

## Usage

```ts
import { ThroughSequence } from "shelving/sequence";

async function* numbers() {
  yield 1; yield 2; yield 3;
}

const seq = new ThroughSequence(numbers());
for await (const n of seq) {
  console.log(n); // 1, 2, 3
}
```

## See also

- [LazySequence](/sequence/LazySequence) — a `ThroughSequence` with start/stop callbacks.
- [InspectSequence](/sequence/InspectSequence) — a `ThroughSequence` that records what passed through.
- [sequence](/sequence) — overview of all sequence primitives.

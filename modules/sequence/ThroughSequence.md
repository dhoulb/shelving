# ThroughSequence

Wraps a source `AsyncIterator` and presents it as a full `Sequence`. Use it to turn a bare async iterator into a reusable `AsyncIterable`, and to guarantee `return()` and `throw()` are always available — delegating to the source when it provides them.

`ThroughSequence` is the base class for `LazySequence` and `InspectSequence`, which add behaviour on top of the pass-through.

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

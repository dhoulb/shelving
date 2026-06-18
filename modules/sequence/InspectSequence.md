# InspectSequence

A [`ThroughSequence`](/sequence/ThroughSequence) that records what passes through it without changing the values. As it iterates a source sequence it tracks the `first` and `last` yielded values, the `count` of values, whether iteration is `done`, and the final `returned` value.

Useful in tests and diagnostics when you need to assert on what a sequence produced.

## Usage

```ts
import { InspectSequence } from "shelving/sequence";

async function* numbers() {
  yield 10; yield 20; yield 30;
}

const watch = new InspectSequence(numbers());
for await (const n of watch) {
  console.log("yielded", n);
}

console.log(watch.count);  // 3
console.log(watch.first);  // 10
console.log(watch.last);   // 30
console.log(watch.done);   // true
```

`first`, `last`, and `returned` throw an [`UnexpectedError`](/error/UnexpectedError) if read before the relevant values exist — e.g. `first` before iteration has yielded anything, or `returned` before iteration is `done`.

## See also

- [`ThroughSequence`](/sequence/ThroughSequence) — the base class.
- [`shelving/sequence`](/sequence) — overview of all sequence primitives.

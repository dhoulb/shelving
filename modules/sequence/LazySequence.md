# LazySequence

A [`ThroughSequence`](/sequence/ThroughSequence) paired with a start/stop callback. The [`StartCallback`](/util/start/StartCallback) runs when the first iterator begins iterating; the [`StopCallback`](/util/start/StopCallback) it returns runs when the last iterator finishes. This is the sequence equivalent of an observable subscription — work happens only while something is listening.

## Usage

Pass a source iterator and a start callback. The callback sets up the work and returns a teardown function:

```ts
import { DeferredSequence, LazySequence } from "shelving/sequence";

const deferred = new DeferredSequence<number>();

const seq = new LazySequence(deferred, () => {
  const id = setInterval(() => deferred.resolve(Date.now()), 500);
  return () => clearInterval(id); // StopCallback — runs when the last iterator finishes.
});

for await (const ts of seq) {
  console.log(ts); // the interval runs only for the duration of this loop
}
```

## See also

- [`ThroughSequence`](/sequence/ThroughSequence) — the base class.
- [`DeferredSequence`](/sequence/DeferredSequence) — the source commonly wrapped by a `LazySequence`.
- [sequence](/sequence) — overview of all sequence primitives.

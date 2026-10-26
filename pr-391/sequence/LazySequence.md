# LazySequence

- Kind: class
- Import: `import { LazySequence } from "shelving/sequence";`
- Extends: `ThroughSequence<T, R, N>`
- Implements: `AsyncDisposable`

Sequence of values that calls a `StartCallback` when it has iterators that are iterating, and calls the corresponding `StopCallback` when all iterators have finished.
- The `start` callback runs lazily on the first active iterator and the returned stop callback runs when the last iterator finishes.

A `ThroughSequence` paired with a start/stop callback. The `StartCallback` runs when the first iterator begins iterating; the `StopCallback` it returns runs when the last iterator finishes. This is the sequence equivalent of an observable subscription — work happens only while something is listening.

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


## Signatures

```ts
new LazySequence<T, R, N>(source: AsyncIterator<T, R, N>, start: StartCallback)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `AsyncIterator<T, R, N>` |  |
| `start` | `StartCallback` |  |

## Returns

| Type | Description |
| --- | --- |
| `LazySequence<T, R, N>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `iterators` | `number` | Number of iterators currently registered as iterating. Read only. |

## Methods

- [start](LazySequence/start.md): An iterator started iterating.
- [stop](LazySequence/stop.md): An iterator stopped iterating.

# Async sequence helpers

Helpers for working with `AsyncIterable` sequences — repeating, driving, merging, and side-effecting streams of values. Used internally for real-time database subscriptions and polling loops.

**Things to know:**

- [`runSequence()`](/util/sequence/runSequence) drives an async iterable outside of an `async for` loop and returns a `stop()` callback. Errors are delivered to `onError` and iteration continues — it does not stop on thrown errors unless the iterator itself signals done.
- [`repeatUntil()`](/util/sequence/repeatUntil) wraps a source async iterable and races each `next()` call against one or more abort promises. When an abort signal resolves, the source iterator's `return()` is called for clean teardown.
- [`mergeSequences()`](/util/sequence/mergeSequences) iterates sequences **in series** (one after another), not in parallel.

## Usage

### Running a sequence imperatively

```ts
import { runSequence } from "shelving/util";

const stop = runSequence(
  myAsyncIterable,
  value => { console.log("next:", value); },
  err   => { console.error("error:", err); },
  final => { console.log("done:", final); },
);

// Later, cancel it:
stop();
```

### Repeating with a cancel signal

```ts
import { repeatUntil } from "shelving/util";

const abortPromise = new Promise<void>(resolve => setTimeout(resolve, 5000));

for await (const value of repeatUntil(myAsyncIterable, abortPromise)) {
  console.log(value); // stops after 5 seconds
}
```

### Polling on an interval

```ts
import { repeatDelay } from "shelving/util";

for await (const count of repeatDelay(1000)) {
  console.log("tick", count); // fires every 1 second, forever
}
```

### Side-effects without breaking the pipeline

```ts
import { callSequence } from "shelving/util";

for await (const item of callSequence(myAsyncIterable, item => analytics.track(item))) {
  // item is yielded unchanged after the callback runs
}
```

### Merging sequences in series

```ts
import { mergeSequences } from "shelving/util";

for await (const item of mergeSequences(sequenceA, sequenceB)) {
  // exhausts sequenceA, then exhausts sequenceB
}
```

### Type guard

```ts
import { isSequence } from "shelving/util";

isSequence(myAsyncIterable);  // true
isSequence([1, 2, 3]);        // false  (sync iterables are not async iterables)
```

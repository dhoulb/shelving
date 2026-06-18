# Async helpers

Helpers for working with promises and async values: detecting sync/async values, running concurrent promises safely, creating deferreds, and handling cancellation with `AbortSignal`.

- [`awaitValues()`](/util/async/awaitValues) differs from `Promise.all` in one important way: it waits for **all** promises to settle before rejecting, so no promise is left dangling in unhandled purgatory.
- [`awaitRace()`](/util/async/awaitRace) silently absorbs rejections from the losing arm(s), preventing unhandled-rejection warnings in cancellation/timeout patterns.

## Usage

### Detecting sync vs async values

```ts
import { isAsync, notAsync, throwAsync, assertAsync, assertNotAsync } from "shelving/util";

isAsync(promise);      // true
notAsync("hello");     // true

// Suspense-style: throw the promise if async, return value if sync
const value = throwAsync(maybePromise);
```

### Running concurrent promises

```ts
import { awaitValues, awaitErrors } from "shelving/util";

// Like Promise.all() but waits for ALL to settle before rejecting
const [a, b] = await awaitValues(fetchUser(), fetchConfig());

// Collect rejection reasons without throwing
const errors = await awaitErrors(op1(), op2(), op3());
```

### Creating a deferred

```ts
import { createDeferred } from "shelving/util";

const { promise, resolve, reject } = createDeferred<string>();

// Later — from outside the promise executor
resolve("done");
```

### Delays and cancellation

```ts
import { getDelay, awaitAbort, awaitRace } from "shelving/util";

await getDelay(500); // wait 500 ms

// Combine a timeout with an AbortSignal — whichever fires first wins
await awaitRace(getDelay(3000), awaitAbort(signal));
```

### Flushing microtasks (tests)

```ts
import { runMicrotasks } from "shelving/util";

await runMicrotasks(); // drain all queued microtasks
```

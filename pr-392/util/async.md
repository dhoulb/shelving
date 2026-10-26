# shelving/util/async

- Kind: module
- Import: `import { … } from "shelving/util/async";`

Helpers for working with promises and async values: detecting sync/async values, running concurrent promises safely, creating deferreds, and handling cancellation with `AbortSignal`.

- `awaitValues()` differs from `Promise.all` in one important way: it waits for **all** promises to settle before rejecting, so no promise is left dangling in unhandled purgatory.
- `awaitRace()` silently absorbs rejections from the losing arm(s), preventing unhandled-rejection warnings in cancellation/timeout patterns.

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


## Functions

- [isAsync()](async/isAsync.md): Is a value an asynchronous value implementing a then() function.
- [notAsync()](async/notAsync.md): Is a value a synchronous value.
- [throwAsync()](async/throwAsync.md): Throw the value if it's an async (promised) value.
- [assertNotAsync()](async/assertNotAsync.md): Assert an unknown value is synchronous (i.e. does not have a .then() method).
- [assertAsync()](async/assertAsync.md): Assert an unknown value is asynchronous (i.e. has a .then() method).
- [assertPromise()](async/assertPromise.md): Assert that an unknown value is a Promise.
- [runMicrotasks()](async/runMicrotasks.md): Run any queued microtasks now.
- [awaitValues()](async/awaitValues.md): Get the result of multiple promises concurrently.
- [awaitErrors()](async/awaitErrors.md): Get the rejection reasons of multiple promises (concurrently).
- [createDeferred()](async/createDeferred.md): Create a deferred to access the resolve() and reject() functions of a promise.
- [getDelay()](async/getDelay.md): Get a promise that automatically resolves after a delay.
- [awaitAbort()](async/awaitAbort.md): Get a promise that rejects with the signal's reason when an AbortSignal fires.
- [awaitRace()](async/awaitRace.md): Race promises like Promise.race() but silently swallow rejections from the losers.

## Classes

- [BasePromise](async/BasePromise.md): Promise designed for extending with ._resolve() and ._reject() methods that can be accessed by subclasses.

## Types

- [Deferred](async/Deferred.md): Deferred allows you to access the internal resolve/reject callbacks of a Promise.

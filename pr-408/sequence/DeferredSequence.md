# DeferredSequence

- Kind: class
- Import: `import { DeferredSequence } from "shelving/sequence";`
- Extends: `Sequence<T, R, N>`
- Implements: `Deferred<T>`, `Promise<T>`

Deferred sequence of values that can be async iterated and new values can be published.
- Implements `Deferred` so the next result can be set.
- Implements `Promise` so the next result can be awaited.
- Implements `AsyncIterable` so values can be iterated over using `for await...of`
- Call `resolve(value)` to publish the next value, `reject(reason?)` to publish an error, or `done(value?)` to signal completion.

A sequence that external code drives on demand. Call `resolve(value)` to publish the next value to every active iterator, `reject(reason)` to publish an error, or `done()` to end iteration cleanly. Calling `cancel()` discards a queued resolution without advancing iterators.

`DeferredSequence` is also a `Promise`, so you can `await` it directly to get just the next value without a loop. It is the primitive `shelving/store` uses internally to broadcast changes.

## Usage

### Publish and subscribe

```ts
import { DeferredSequence } from "shelving/sequence";

const seq = new DeferredSequence<string>();

// Produce values from anywhere:
setInterval(() => seq.resolve("ping"), 1000);

// Consume in one or more places simultaneously:
for await (const msg of seq) {
  console.log(msg); // "ping" every second
}
```

Multiple concurrent iterators all advance together — a single `resolve()` delivers to every one.

### Await the next value

Because `DeferredSequence` implements `Promise`, you can `await` it for a single value without setting up a loop:

```ts
const next = await seq; // resolves when resolve() is next called
```


## Signatures

```ts
new DeferredSequence<T, R, N>()
```

## Returns

| Type | Description |
| --- | --- |
| `DeferredSequence<T, R, N>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `promise` | `Promise<T>` | Next promise to be resolved/rejected with the upcoming value. Read only. |

## Methods

- [DeferredSequence.resolve()](DeferredSequence/resolve.md): Resolve the current deferred in the sequence with a value.
- [DeferredSequence.reject()](DeferredSequence/reject.md): Reject the current deferred in the sequence with an error.
- [DeferredSequence.done()](DeferredSequence/done.md): Signal that the sequence is done, causing any active for await loops to exit cleanly.
- [DeferredSequence.cancel()](DeferredSequence/cancel.md): Cancel the current resolution or rejection.
- [DeferredSequence.through()](DeferredSequence/through.md): Resolve the current deferred from a sequence of values.
- [DeferredSequence.next()](DeferredSequence/next.md)
- [DeferredSequence.then()](DeferredSequence/then.md)
- [DeferredSequence.catch()](DeferredSequence/catch.md)
- [DeferredSequence.finally()](DeferredSequence/finally.md)

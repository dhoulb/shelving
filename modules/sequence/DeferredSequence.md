# DeferredSequence

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

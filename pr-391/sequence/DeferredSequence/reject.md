# DeferredSequence.reject()

- Kind: method
- Member of: `DeferredSequence`

Reject the current deferred in the sequence with an error.
- Sends a `{ reason: X }` to any iterators, causing `for await` loops to throw.

## Signatures

```ts
reject(reason: unknown): void
```

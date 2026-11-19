# DeferredSequence.done()

- Kind: method
- Member of: `DeferredSequence`

Signal that the sequence is done, causing any active `for await` loops to exit cleanly.
- Sends a `{ done: true, value: R }` to any iterators.

## Signatures

```ts
done(value?: R | undefined): void
```

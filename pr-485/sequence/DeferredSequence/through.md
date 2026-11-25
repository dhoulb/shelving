# DeferredSequence.through()

- Kind: method
- Member of: `DeferredSequence`

Resolve the current deferred from a sequence of values.
- Iterates `sequence`, republishing each value through this deferred sequence and yielding it on.

## Signatures

```ts
through(sequence: AsyncIterable<T>): AsyncIterator<T>
```

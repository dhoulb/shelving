# Sequence.throw()

- Kind: method
- Member of: `Sequence`

Throw an error into this iterator.
- Mirrors the default async generator `throw()` behaviour.
- Subclasses can override this to recover from errors or perform cleanup.

## Signatures

```ts
throw(reason?: unknown): Promise<IteratorResult<T, R | undefined>>
```

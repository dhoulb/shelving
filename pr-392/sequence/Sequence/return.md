# Sequence.return()

- Kind: method
- Member of: `Sequence`

Finish iteration and optionally provide the iterator's final return value.
- Mirrors the default async generator `return()` behaviour.
- Subclasses can override this to perform cleanup before the sequence stops.

## Signatures

```ts
return(value?: R | undefined | PromiseLike<R | undefined>): Promise<IteratorResult<T, R | undefined>>
```

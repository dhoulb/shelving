# FetchCallback

- Kind: type
- Import: `import { FetchCallback } from "shelving/store";`

Callback that fetches the next value for a `FetchStore`.
- Receives the current `AbortSignal` so it can cancel in-flight HTTP requests when the fetch is aborted.
- May return a value synchronously or a `PromiseLike` resolving to one (which the store will await).

## Signatures

```ts
(signal: AbortSignal) => StoreInput<T> | PromiseLike<StoreInput<T>>
```

## Types

- `AbortSignal`
- [StoreInput](StoreInput.md): Synchronous values that a store natively knows how to process as inputs.
- `PromiseLike`

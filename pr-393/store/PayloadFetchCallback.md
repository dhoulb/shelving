# PayloadFetchCallback

- Kind: type
- Import: `import { PayloadFetchCallback } from "shelving/store";`

Callback that fetches the next value for a `PayloadFetchStore` from a payload.
- Receives the current payload plus the `AbortSignal` so it can cancel in-flight requests.
- May return a value synchronously or a `PromiseLike` resolving to one (which the store will await).

## Signatures

```ts
(payload: P, signal: AbortSignal) => AsyncStoreInput<R>
```

## Types

- `AbortSignal`
- [AsyncStoreInput](AsyncStoreInput.md): Synchronous or asynchronous values that a store natively knows how to process as inputs.

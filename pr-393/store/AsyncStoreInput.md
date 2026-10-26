# AsyncStoreInput

- Kind: type
- Import: `import { AsyncStoreInput } from "shelving/store";`

Synchronous or asynchronous values that a store natively knows how to process as inputs.
- A `StoreInput<I>` or a `PromiseLike` that resolves to one (which the store will await).

## Signatures

```ts
StoreInput<I> | PromiseLike<StoreInput<I>>
```

## Types

- [StoreInput](StoreInput.md): Synchronous values that a store natively knows how to process as inputs.
- `PromiseLike`

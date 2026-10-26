# StoreReducer

- Kind: type
- Import: `import { StoreReducer } from "shelving/store";`

Reducer that receives a store's current value and returns the store's next value (possibly asynchronously).

## Signatures

```ts
(value: O, ...args: A) => AsyncStoreInput<I>
```

## Types

- [AsyncStoreInput](AsyncStoreInput.md): Synchronous or asynchronous values that a store natively knows how to process as inputs.

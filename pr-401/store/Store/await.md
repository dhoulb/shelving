# Store.await()

- Kind: method
- Member of: `Store`

Await an async value and save it to this store.
- Saves the resolved value.
- If it rejects saves the rejection as `reason`.
- Silently discarded if a newer value is set.
- Silently discarded if `await()` is called again.
- Silently discarded if `abort()` is called.

## Signatures

```ts
await(pending: PromiseLike<StoreInput<TT>>): Promise<boolean>
```

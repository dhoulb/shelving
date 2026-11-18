# Store.write()

- Kind: method
- Member of: `Store`

Write a synchronous value to this store.
- Aborts any pending `await()` call and clears any error `reason`.
- `SKIP` is ignored entirely; `NONE` puts the store into a loading state; any other value is converted, stored, and emitted (if it differs from the current value).

## Signatures

```ts
write(input: StoreInput<TT>): void
```

# DBProvider.transact()

- Kind: method
- Member of: `DBProvider`

Run a callback as a single atomic transaction — every write made through the callback's provider is committed together, or not at all.

- The callback receives a transaction-scoped `DBProvider`; reads and writes made through it belong to the transaction.
- Reads see a consistent snapshot of the data from before the transaction, and do not see the transaction's own uncommitted writes.
- If the callback throws, nothing is committed and the error is rethrown.
- The callback may run more than once if the backend retries on contention, so it must have no side effects other than through its provider.
- Portable code must not use realtime sequences or nested `transact()` calls inside a transaction — most backends throw `UnsupportedError`, though some (e.g. `MemoryDBProvider`) support them scoped to the transaction.
- Not every provider supports transactions — the base implementation throws `UnsupportedError`.

## Signatures

```ts
transact(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X>
```

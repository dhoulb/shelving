# TransactionTestDBProvider

- Kind: class
- Import: `import { TransactionTestDBProvider } from "shelving/test";`
- Extends: `MemoryDBProvider<I, T>`

In-memory provider for testing wrapping providers' `transact()` — runs the callback directly against itself.

- No atomicity or rollback: writes apply immediately and are kept even if the callback throws.
- Use it as the `source` of a wrapping provider to test how the wrapper behaves inside transactions, not to test transaction semantics themselves.

## Signatures

```ts
new TransactionTestDBProvider<I, T>()
```

## Returns

| Type | Description |
| --- | --- |
| `TransactionTestDBProvider<I, T>` |  |

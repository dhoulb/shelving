# FetchStore.invalidate()

- Kind: method
- Member of: `FetchStore`

Invalidate this store so a new fetch is triggered on the next read of `loading` or `value`.
- Triggers `abort()` so any current awaits are cancelled.

## Signatures

```ts
invalidate(): void
```

# FetchStore.refresh()

- Kind: method
- Member of: `FetchStore`

Fetch the result for this store now.
- Triggered automatically when someone reads `value` or `loading`.
- Refreshes are de-duplicated. Concurrent calls while a fetch is in-flight return the same promise.
- Never throws — errors are stored as `reason`.

## Signatures

```ts
refresh(maxAge: number = ALWAYS_REFRESH): Promise<boolean> | boolean
```

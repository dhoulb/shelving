# FetchStore.refresh()

- Kind: method
- Member of: `FetchStore`

Fetch the result for this store now.
- Triggered automatically when someone reads `value` or `loading`.
- Refreshes are de-duplicated. Concurrent calls while a fetch is in-flight return the same promise.
- A new fetch clears any old `reason`, so the store shows as loading while it waits.
- A failed fetch keeps the current value if there is one, and the next refresh tries again. With no value, the error is saved as `reason`.

## Signatures

```ts
refresh(maxAge: number = ALWAYS_REFRESH): Promise<boolean> | boolean
```

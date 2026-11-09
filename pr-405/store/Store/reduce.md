# Store.reduce()

- Kind: method
- Member of: `Store`

Send the current value to a callback and save the returned value to this store.
- If the callback returns an async value, it is awaited and values/errors will be saved.

## Signatures

```ts
reduce(reducer: StoreReducer<TT, T, A>, ...args: A): Promise<boolean> | boolean
```

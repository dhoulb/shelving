# Store.call()

- Kind: method
- Member of: `Store`

Call a callback and save the returned value to this store.
- If the callback returns an async value, it is awaited and values/errors will be saved.

## Signatures

```ts
call(callback: StoreCallback<TT, A>, ...args: A): Promise<boolean> | boolean
```

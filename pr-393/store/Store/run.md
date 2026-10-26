# Store.run()

- Kind: method
- Member of: `Store`

Run a callback and ignore any returned value.
- If the callback returns an async value, it is awaited and errors will be saved.

## Signatures

```ts
run(callback: (...args: A) => void, ...args: A): Promise<boolean> | boolean
```

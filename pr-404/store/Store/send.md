# Store.send()

- Kind: method
- Member of: `Store`

Send the current value to a callback and ignore any returned value.
- If the callback returns an async value, it is awaited and errors will be saved.

## Signatures

```ts
send(callback: (value: T, ...args: A) => void, ...args: A): Promise<boolean> | boolean
```

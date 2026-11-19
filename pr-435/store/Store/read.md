# Store.read()

- Kind: method
- Member of: `Store`

Called to read values. Can be used to override get behaviour.
- Override in subclasses to change getting behaviour.
- Note: doesn't throw `reason` if there is one!

## Signatures

```ts
read(): StoreInternal<T>
```

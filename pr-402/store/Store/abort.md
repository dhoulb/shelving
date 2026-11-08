# Store.abort()

- Kind: method
- Member of: `Store`

Abort any current pending `await()` call.
- The pending call's result will be silently discarded and its error will not be stored.

## Signatures

```ts
abort(): void
```

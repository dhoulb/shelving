# FormStore.submit()

- Kind: method
- Member of: `FormStore`

Validate the current form value and run an optional submit callback with it.
- On a validation failure the error is stored as the `reason` and `false` is returned.

## Signatures

```ts
submit(callback?: ((value: T, ...args: A) => void) | undefined, ...args: A): boolean | Promise<boolean>
```

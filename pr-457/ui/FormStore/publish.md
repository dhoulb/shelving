# FormStore.publish()

- Kind: method
- Member of: `FormStore`

Validate and set a value for a named field of this form.
- Clears the main and field messages, then validates and stores the value.
- On a string validation error the message is recorded and the raw value is still persisted.

## Signatures

```ts
publish(name: K, unsafeValue: T[K]): void
```

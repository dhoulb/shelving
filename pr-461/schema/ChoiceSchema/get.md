# ChoiceSchema.get()

- Kind: method
- Member of: `ChoiceSchema`

Get an unknown value as one of the allowed choices, or `undefined` if it isn't one.

- Non-throwing counterpart to `validate()`, which defers to this and throws when it returns `undefined`.
- Use it to normalise a value for display (e.g. in a form input) without raising on invalid or sentinel values.

## Signatures

```ts
get(unsafeValue: unknown = this.value): O | undefined
```

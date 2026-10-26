# StringSchema.sanitize()

- Kind: method
- Member of: `StringSchema`

Sanitize the string by removing unwanted characters.

- Uses multiline sanitization when `multiline` is set, otherwise single-line sanitization.
- Applies the configured `case` folding (`"upper"` or `"lower"`) if set.

## Signatures

```ts
sanitize(str: string): string
```

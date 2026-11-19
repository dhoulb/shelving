# NULL

- Kind: constant
- Import: `import { NULL } from "shelving/schema";`

Null validator that always returns `null`.

## Signatures

```ts
NULL: Schema<null>
```

## Examples

```ts
NULL.validate(anything) // null
```

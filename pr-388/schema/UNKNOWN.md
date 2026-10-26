# UNKNOWN

- Kind: constant
- Import: `import { UNKNOWN } from "shelving/schema";`

Unknown validator that always passes through its input value as `unknown`.

## Signatures

```ts
UNKNOWN: Schema<unknown>
```

## Examples

```ts
UNKNOWN.validate(anything) // anything
```

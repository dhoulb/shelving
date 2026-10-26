# NEGATIVE_INTEGER

- Kind: constant
- Import: `import { NEGATIVE_INTEGER } from "shelving/schema";`

Sugar instance of `NumberSchema` for a negative integer (excluding zero). Equivalent to `new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: -1 })`.

## Examples

```ts
NEGATIVE_INTEGER.validate(-3); // Returns -3
```

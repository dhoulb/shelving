# POSITIVE_INTEGER

- Kind: constant
- Import: `import { POSITIVE_INTEGER } from "shelving/schema";`

Sugar instance of `NumberSchema` for a positive integer (excluding zero). Equivalent to `new NumberSchema({ step: 1, min: 1, max: Number.MAX_SAFE_INTEGER })`.

## Examples

```ts
POSITIVE_INTEGER.validate(0); // Throws "Required"
```

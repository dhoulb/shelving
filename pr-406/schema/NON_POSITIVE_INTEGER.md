# NON_POSITIVE_INTEGER

- Kind: constant
- Import: `import { NON_POSITIVE_INTEGER } from "shelving/schema";`

Sugar instance of `NumberSchema` for a non-positive integer (including zero). Equivalent to `new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: 0 })`.

## Examples

```ts
NON_POSITIVE_INTEGER.validate(0); // Returns 0
```

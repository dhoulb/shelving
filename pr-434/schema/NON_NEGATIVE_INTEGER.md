# NON_NEGATIVE_INTEGER

- Kind: constant
- Import: `import { NON_NEGATIVE_INTEGER } from "shelving/schema";`

Sugar instance of `NumberSchema` for a non-negative integer (including zero). Equivalent to `new NumberSchema({ step: 1, min: 0, max: Number.MAX_SAFE_INTEGER })`.

## Examples

```ts
NON_NEGATIVE_INTEGER.validate(0); // Returns 0
```

# INTEGER

- Kind: constant
- Import: `import { INTEGER } from "shelving/schema";`

Sugar instance of `NumberSchema` for an integer. Equivalent to `new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER })`.

## Examples

```ts
INTEGER.validate("42.7"); // Returns 43 (rounded to step)
```

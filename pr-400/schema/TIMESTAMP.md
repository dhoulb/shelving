# TIMESTAMP

- Kind: constant
- Import: `import { TIMESTAMP } from "shelving/schema";`

Sugar instance of `NumberSchema` for a Unix timestamp (including milliseconds). Equivalent to `new NumberSchema({ title: "Timestamp", step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER })`.

## Examples

```ts
TIMESTAMP.validate(1700000000000); // Returns 1700000000000
```

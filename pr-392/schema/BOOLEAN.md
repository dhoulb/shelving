# BOOLEAN

- Kind: constant
- Import: `import { BOOLEAN } from "shelving/schema";`

Sugar instance of `BooleanSchema` for a coerced boolean. Equivalent to `new BooleanSchema({})`.

## Examples

```ts
BOOLEAN.validate("yes"); // Returns true
```

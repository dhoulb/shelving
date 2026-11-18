# REQUIRED_STRING

- Kind: constant
- Import: `import { REQUIRED_STRING } from "shelving/schema";`

Sugar instance of `StringSchema` requiring at least one character. Equivalent to `new StringSchema({ min: 1 })`.

## Examples

```ts
REQUIRED_STRING.validate(""); // Throws "Required"
```

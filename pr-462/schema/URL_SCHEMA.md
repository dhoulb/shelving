# URL_SCHEMA

- Kind: constant
- Import: `import { URL_SCHEMA } from "shelving/schema";`

Sugar instance of `URLSchema` for an absolute or relative URL string. Equivalent to `new URLSchema({})`.

## Examples

```ts
URL_SCHEMA.validate("https://www.google.com") // "https://www.google.com/"
```

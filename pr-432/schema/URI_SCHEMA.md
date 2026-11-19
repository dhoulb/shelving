# URI_SCHEMA

- Kind: constant
- Import: `import { URI_SCHEMA } from "shelving/schema";`

Sugar instance of `URISchema` for an absolute URI string. Equivalent to `new URISchema({})`.

## Examples

```ts
URI_SCHEMA.validate("https://www.google.com") // "https://www.google.com/"
```

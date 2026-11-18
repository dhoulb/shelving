# DATE

- Kind: constant
- Import: `import { DATE } from "shelving/schema";`

Sugar instance of `DateSchema` for a required date. Equivalent to `new DateSchema({})`.

## Examples

```ts
DATE.validate("2005-09-12") // "2005-09-12"
```

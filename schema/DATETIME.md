# DATETIME

- Kind: constant
- Import: `import { DATETIME } from "shelving/schema";`

Sugar instance of `DateTimeSchema` for a required UTC datetime. Equivalent to `new DateTimeSchema({})`.

## Examples

```ts
DATETIME.validate("2005-09-12T08:00:00Z") // "2005-09-12T08:00:00.000Z"
```

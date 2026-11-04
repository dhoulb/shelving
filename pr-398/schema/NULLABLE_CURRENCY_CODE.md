# NULLABLE_CURRENCY_CODE

- Kind: constant
- Import: `import { NULLABLE_CURRENCY_CODE } from "shelving/schema";`

Sugar instance allowing a `CURRENCY_CODE` or `null`. Equivalent to `NULLABLE(CURRENCY_CODE)`.

## Examples

```ts
NULLABLE_CURRENCY_CODE.validate(null) // null
```

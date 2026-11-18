# PHONE

- Kind: constant
- Import: `import { PHONE } from "shelving/schema";`

Sugar instance of `PhoneSchema` for a valid phone number. Equivalent to `new PhoneSchema({})`.

## Examples

```ts
PHONE.validate("+441234567890"); // Returns "+441234567890"
```

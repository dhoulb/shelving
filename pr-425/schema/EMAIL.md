# EMAIL

- Kind: constant
- Import: `import { EMAIL } from "shelving/schema";`

Sugar instance of `EmailSchema` for a valid email address. Equivalent to `new EmailSchema({})`.

## Examples

```ts
EMAIL.validate("test@test.com"); // Returns "test@test.com"
```

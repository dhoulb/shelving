# PASSWORD

- Kind: constant
- Import: `import { PASSWORD } from "shelving/schema";`

Sugar instance of `PasswordSchema` for a password string. Equivalent to `new PasswordSchema({})`.

## Examples

```ts
PASSWORD.validate("hunter2"); // Returns "hunter2"
```

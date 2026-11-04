# KEY

- Kind: constant
- Import: `import { KEY } from "shelving/schema";`

Sugar instance of `KeySchema` for a database key. Equivalent to `new KeySchema({ title: "ID" })`.

## Examples

```ts
KEY.validate("a1b2c3") // "a1b2c3"
```

# NAME

- Kind: constant
- Import: `import { NAME } from "shelving/schema";`

Sugar instance of `StringSchema` for a name of 1–100 characters. Equivalent to `new StringSchema({ one: "name", title: "Name", min: 1, max: 100 })`.

## Examples

```ts
NAME.validate("Dave"); // Returns "Dave"
```

# NUMBER

- Kind: constant
- Import: `import { NUMBER } from "shelving/schema";`

Sugar instance of `NumberSchema` for an unconstrained number. Equivalent to `new NumberSchema({ title: "Number" })`.

## Examples

```ts
NUMBER.validate("42"); // Returns 42
```

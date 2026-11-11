# STRING

- Kind: constant
- Import: `import { STRING } from "shelving/schema";`

Sugar instance of `StringSchema` for an unconstrained string. Equivalent to `new StringSchema({})`.

## Examples

```ts
STRING.validate(123); // Returns "123"
```

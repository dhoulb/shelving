# ENTITY

- Kind: constant
- Import: `import { ENTITY } from "shelving/schema";`

Sugar instance of `EntitySchema` for an entity string, e.g. `challenge:a1b2c3`. Equivalent to `new EntitySchema({})`.

## Examples

```ts
ENTITY.validate("challenge:a1b2c3") // "challenge:a1b2c3"
```

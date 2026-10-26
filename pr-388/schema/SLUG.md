# SLUG

- Kind: constant
- Import: `import { SLUG } from "shelving/schema";`

Sugar instance of `SlugSchema` for a valid slug. Equivalent to `new SlugSchema({})`.

## Examples

```ts
SLUG.validate("This is a Slug!") // "this-is-a-slug"
```

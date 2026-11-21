# TITLE

- Kind: constant
- Import: `import { TITLE } from "shelving/schema";`

Sugar instance of `StringSchema` for a title of 1–100 characters. Equivalent to `new StringSchema({ one: "title", title: "Title", min: 1, max: 100 })`.

## Examples

```ts
TITLE.validate("My Title"); // Returns "My Title"
```

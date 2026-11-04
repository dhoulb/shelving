# IMAGE

- Kind: constant
- Import: `import { IMAGE } from "shelving/schema";`

Sugar instance of `ImageSchema` for an image file name, e.g. `photo.jpg`. Equivalent to `new ImageSchema({})`.

## Examples

```ts
IMAGE.validate("photo.jpg"); // Returns "photo.jpg"
```

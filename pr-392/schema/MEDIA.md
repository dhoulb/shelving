# MEDIA

- Kind: constant
- Import: `import { MEDIA } from "shelving/schema";`

Sugar instance of `MediaSchema` for an image or video file name, e.g. `photo.jpg`. Equivalent to `new MediaSchema({})`.

## Examples

```ts
MEDIA.validate("clip.mp4"); // Returns "clip.mp4"
```

# VIDEO

- Kind: constant
- Import: `import { VIDEO } from "shelving/schema";`

Sugar instance of `VideoSchema` for a video file name, e.g. `clip.mp4`. Equivalent to `new VideoSchema({})`.

## Examples

```ts
VIDEO.validate("clip.mp4"); // Returns "clip.mp4"
```

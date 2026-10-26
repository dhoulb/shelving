# shelving/util/file

- Kind: module
- Import: `import { … } from "shelving/util/file";`

Tiny helpers for splitting filenames into base name and extension. They exist so callers never need to hand-roll `lastIndexOf(".")` logic or handle the dotfile edge case themselves.

**Things to know:**

- `splitFileExtension(".gitignore")` returns `[undefined, "gitignore"]` — a leading dot only is treated as the extension, not the base name.
- `splitFileExtension("no-ext")` returns `["no-ext", undefined]`.
- Extensions are returned **without** a leading dot, e.g. `"ts"` not `".ts"`.

## Usage

```ts
import { splitFileExtension, getFileExtension, requireFileExtension } from "shelving/util";

splitFileExtension("array.ts");       // ["array", "ts"]
splitFileExtension("archive.tar.gz"); // ["archive.tar", "gz"]
splitFileExtension("no-ext");         // ["no-ext", undefined]
splitFileExtension(".gitignore");     // [undefined, "gitignore"]
splitFileExtension(undefined);        // [undefined, undefined]

getFileExtension("index.html");       // "html"
getFileExtension("no-ext");           // undefined

requireFileExtension("style.css");    // "css"
requireFileExtension("no-ext");       // throws RequiredError
```


## Functions

- [getFileAccept](file/getFileAccept.md): Get the accept attribute of a file input for a set of file types, e.g. "image/jpeg,image/png".
- [splitFileExtension](file/splitFileExtension.md): Split a filename into its base name and extension in a single pass.
- [getFileExtension](file/getFileExtension.md): Get the file extension from a file path, e.g. "md", or return undefined if the input has no extension.
- [requireFileExtension](file/requireFileExtension.md): Get the file extension from a file path e.g. "tsx", or throw RequiredError if the input has no extension.

## Types

- [FileTypes](file/FileTypes.md): List of file types in extension: mime format.
- [FileCapture](file/FileCapture.md): Which camera a file picker opens straight away: "user" is the front (selfie) camera, "environment" the back camera.

## Constants

- [IMAGE_TYPES](file/IMAGE_TYPES.md): Image file types in extension: mime format: JPEG, PNG, WebP, GIF, and AVIF.
- [VIDEO_TYPES](file/VIDEO_TYPES.md): Video file types in extension: mime format: MP4, QuickTime, and WebM.
- [MEDIA_TYPES](file/MEDIA_TYPES.md): Media file types in extension: mime format: every type in IMAGE_TYPES and VIDEO_TYPES.

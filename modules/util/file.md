# File extension helpers

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

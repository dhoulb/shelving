# shelving/util/path

- Kind: module
- Import: `import { … } from "shelving/util/path";`

Typed helpers for working with filesystem and URL paths. Used throughout the router to represent and manipulate `AbsolutePath` values — strings that always start with `/`.

**Things to know:**

- `AbsolutePath` is a template-literal type (`/${string}`). TypeScript enforces it at compile time.
- All helpers normalise runs of `//`, convert `\` Windows separators, and strip trailing slashes.
- `getPath()` returns `undefined` on invalid input; `requirePath()` throws `RequiredError` instead.
- `splitPath("/")` returns `[]` — the root has no segments.

## Usage

### Checking and converting paths

```ts
import { isAbsolutePath, isRelativePath, getPath, requirePath } from "shelving/util";

isAbsolutePath("/foo/bar");   // true
isAbsolutePath("./foo");      // false
isRelativePath("./foo");      // true

getPath("/a//b/./c/");        // "/a/b/c"
getPath("./child", "/parent"); // "/parent/child"
getPath(null);                 // undefined

requirePath("not-a-path");     // throws RequiredError
```

### Building and splitting paths

```ts
import { joinPath, splitPath, cleanPath } from "shelving/util";

joinPath("/foo", "bar", "baz");       // "/foo/bar/baz"
joinPath("/foo", ["bar", "baz"]);     // "/foo/bar/baz"
joinPath("/a//", "/b/");              // "/a/b"

splitPath("/foo/bar/baz");  // ["foo", "bar", "baz"]
splitPath("/");             // []

cleanPath("/a//./b/");      // "/a/b"
```

### Matching and navigation checks

```ts
import { matchPathPrefix, isPathActive, isPathProud } from "shelving/util";

matchPathPrefix("/app/settings/profile", "/app"); // "/settings/profile"
matchPathPrefix("/app", "/app");                   // "/"
matchPathPrefix("/other", "/app");                 // undefined

isPathActive("/app", "/app");           // true  (exact match)
isPathProud("/app/sub", "/app");        // true  (current is ancestor)
isPathProud("/app", "/app/sub");        // false
```


## Functions

- [isAbsolutePath](path/isAbsolutePath.md): Is a string path an absolute path?
- [isRelativePath](path/isRelativePath.md): Is a string path a relative path?
- [getPath](path/getPath.md): Resolve a relative or absolute path and return the absolute path, or undefined if not a valid path.
- [cleanPath](path/cleanPath.md): Normalise a path.
- [requirePath](path/requirePath.md): Resolve a relative or absolute path and return the path, or throw RequiredError if not a valid path.
- [matchPathPrefix](path/matchPathPrefix.md): Match and strip a base path prefix from a path using segment-aware pathname rules.
- [isPathActive](path/isPathActive.md): Is a target path active relative to the current path?
- [isPathProud](path/isPathProud.md): Is a target path proud relative to the current path?
- [splitPath](path/splitPath.md): Get the "segments" in an absolute path.
- [joinPath](path/joinPath.md): Join one or more path parts into a single path string.

## Types

- [AbsolutePath](path/AbsolutePath.md): Absolute path string starting with a / slash.
- [RelativePath](path/RelativePath.md): Relative path string that is . dot, or starts with ./ dot slash.
- [Path](path/Path.md): Either an absolute or relative path.
- [PossiblePath](path/PossiblePath.md): Things that can be converted to a path.
- [PathPart](path/PathPart.md): A single argument accepted by joinPath() — either a string (full path or single segment) or an array of segments.

# Path helpers

Typed helpers for working with filesystem and URL paths. Used throughout the router to represent and manipulate [`AbsolutePath`](/util/path/AbsolutePath) values — strings that always start with `/`.

**Things to know:**

- [`AbsolutePath`](/util/path/AbsolutePath) is a template-literal type (`/${string}`). TypeScript enforces it at compile time.
- All helpers normalise runs of `//`, convert `\` Windows separators, and strip trailing slashes.
- [`getPath()`](/util/path/getPath) returns `undefined` on invalid input; [`requirePath()`](/util/path/requirePath) throws [`RequiredError`](/error/RequiredError) instead.
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

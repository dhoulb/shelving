# URI helpers

These helpers work with any valid URI — including non-hierarchical ones like `urn:isbn:...` or `mailto:` — and provide typed wrappers, query-param manipulation, and safe conversion utilities. They exist because the built-in `URL` class has loose typing and is mutable, which can cause subtle bugs.

**Things to know:**

- `ImmutableURI` is a re-export of the native `URL` constructor with a tighter TypeScript interface. At runtime it _is_ `URL`; the type just restricts properties to narrower literal types.
- `getURI()` only accepts **complete** URIs (with protocol). Relative inputs always return `undefined`. Use `getBasedURI()` from `url.ts` to resolve a path against a base.
- `withURIParam` / `withURIParams` return the **same URI instance** when the params would not change.
- `getURIParams()` converts `URLSearchParams`, a URI string, a URL object, or a plain dictionary — all to the same `{ key: string }` shape.
- `omitURIParam` is an alias for `omitURIParams` with a single key.

## Usage

### Parsing and validating URIs

```ts
import { getURI, requireURI, isURI, assertURI } from "shelving/util";

getURI("https://example.com/path");   // ImmutableURI
getURI("not-a-uri");                  // undefined
getURI(null);                         // undefined

requireURI("https://example.com");    // ImmutableURI or throws RequiredError
isURI(new URL("https://x.com"));      // true
```

### Reading query params

```ts
import { getURIParams, getURIParam, requireURIParam } from "shelving/util";

const uri = "https://example.com/search?q=shelving&page=2";

getURIParams(uri);              // { q: "shelving", page: "2" }
getURIParam(uri, "q");          // "shelving"
getURIParam(uri, "missing");    // undefined
requireURIParam(uri, "q");      // "shelving"
requireURIParam(uri, "missing"); // throws RequiredError
```

### Modifying query params

```ts
import { withURIParam, withURIParams, omitURIParams, clearURIParams } from "shelving/util";

const base = "https://example.com/search?q=shelving";

withURIParam(base, "page", 2);              // "https://example.com/search?q=shelving&page=2"
withURIParams(base, { page: 3, lang: "en" }); // adds both params
omitURIParams(base, "q");                   // "https://example.com/search"
clearURIParams(base);                       // "https://example.com/search"
```

### Working with URI schemes

```ts
import { HTTP_SCHEMES } from "shelving/util";

HTTP_SCHEMES; // ["http:", "https:"]
```

## See also

- [url](/util/url) — `getURL()`, `getBasedURI()`, and base-URL utilities for hierarchical URLs.
- [util](/util) — naming conventions and the full helper overview.

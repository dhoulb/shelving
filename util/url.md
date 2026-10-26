# shelving/util/url

- Kind: module
- Import: `import { … } from "shelving/util/url";`

These helpers work specifically with hierarchical `scheme://host` URLs (a strict subset of URIs), and add path-matching, base-URL resolution, and active/proud link detection. They exist to handle the common navigation and routing tasks that plain `URI` helpers do not cover.

**Things to know:**

- A URL is distinguished from a generic URI by the `://` in its href. `isURL()` checks this at runtime. `mailto:`, `urn:`, etc. are URIs but not URLs and will not pass `isURL()`.
- `getBaseURL()` ensures a trailing slash on the pathname, which makes relative resolution behave naturally (paths resolve relative to the directory, not the file).
- `getBasedURI()` accepts any input — including relative paths — and resolves them against the base. It can return a non-URL URI (e.g. `mailto:`). Use `getURL()` when you specifically need a `scheme://` URL.
- `isURLActive()` and `isURLProud()` are designed for navigation menus: "active" means exact match, "proud" means the link's URL is an ancestor of the current location.

## Usage

### Parsing and resolving URLs

```ts
import { getURL, requireURL, getBasedURI, isURL, assertURL } from "shelving/util";

getURL("https://example.com/page");          // ImmutableURL
getURL("not-a-url");                         // undefined
getURL("/page", "https://example.com/app/"); // https://example.com/app/page
getBasedURI("/page", "https://example.com/app/b"); // resolves as https://example.com/app/b/page

requireURL("https://example.com");           // ImmutableURL or throws RequiredError
isURL(new URL("https://x.com"));             // true
isURL(new URL("mailto:hi@example.com"));     // false
```

### Base URLs

```ts
import { getBaseURL, requireBaseURL, isBaseURL } from "shelving/util";

getBaseURL("https://example.com/app");    // https://example.com/app/  (slash appended)
getBaseURL("https://example.com/app/");  // same ref (already a base URL)
isBaseURL(new URL("https://x.com/"));    // true
```

### Path matching

```ts
import { matchURLPrefix } from "shelving/util";

matchURLPrefix("https://example.com/app/page", "https://example.com/app");
// "/page"  (path after the base)

matchURLPrefix("https://example.com/app/page/", "https://example.com/app");
// "/page"  (trailing slash normalised away, so `/page` and `/page/` resolve the same)

matchURLPrefix("https://example.com/other", "https://example.com/app");
// undefined  (no match)

matchURLPrefix("https://other.com/app", "https://example.com/app");
// undefined  (origin mismatch)
```

### Active and proud link detection

```ts
import { isURLActive, isURLProud } from "shelving/util";

const current = "https://example.com/app/settings/profile";

isURLActive(current, "https://example.com/app/settings/profile"); // true (exact)
isURLActive(current, "https://example.com/app/settings");         // false

isURLProud(current, "https://example.com/app/settings");          // true (ancestor)
isURLProud(current, "https://example.com/other");                  // false
```


## Functions

- [isURL()](url/isURL.md): Is an unknown value a URL object?
- [assertURL()](url/assertURL.md): Assert that an unknown value is a URL object.
- [getBasedURI()](url/getBasedURI.md): Resolve a possible URI relative to a base, or return undefined if conversion fails.
- [getURL()](url/getURL.md): Resolve a possible URL relative to a base URL, or return undefined if conversion fails.
- [requireURL()](url/requireURL.md): Convert a possible URL to a URL, or throw RequiredError if conversion fails.
- [matchURLPrefix()](url/matchURLPrefix.md): Resolve and match a target URL/path against a base URL and return the remaining path.
- [isURLActive()](url/isURLActive.md): Is a target URL active relative to a base URL?
- [isURLProud()](url/isURLProud.md): Is a target URL proud relative to a base URL?
- [isBaseURL()](url/isBaseURL.md): Is an unknown value a valid Base URL?
- [getBaseURL()](url/getBaseURL.md): Get a Base URL — a true URL whose pathname is normalised to end in a trailing slash.
- [requireBaseURL()](url/requireBaseURL.md): Require a Base URL — a true URL whose pathname is normalised to end in a trailing slash.

## Interfaces

- [ImmutableURLConstructor](url/ImmutableURLConstructor.md): Construct a correctly-typed URL object.
- [ImmutableURL](url/ImmutableURL.md): Object that describes a valid URL, e.g. http://example.com/path/to/resource
- [BaseURL](url/BaseURL.md): BaseURL is a URL with a guaranteed trailing slash on pathname.

## Types

- [URLString](url/URLString.md): A URL string has a protocol and a //.
- [PossibleURL](url/PossibleURL.md): Values that can be converted to a URL instance.

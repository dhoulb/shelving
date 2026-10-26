# shelving/util/uri

- Kind: module
- Import: `import { … } from "shelving/util/uri";`

These helpers work with any valid URI — including non-hierarchical ones like `urn:isbn:...` or `mailto:` — and provide typed wrappers, query-param manipulation, and safe conversion utilities. They exist because the built-in `URL` class has loose typing and is mutable, which can cause subtle bugs.

**Things to know:**

- `ImmutableURI` is a re-export of the native `URL` constructor with a tighter TypeScript interface. At runtime it _is_ `URL`; the type just restricts properties to narrower literal types.
- `getURI()` only accepts **complete** URIs (with protocol). Relative inputs always return `undefined`. Use `getBasedURI()` from `url.ts` to resolve a path against a base.
- `withURIParam()` / `withURIParams()` return the **same URI instance** when the params would not change.
- `getURIParams()` converts `URLSearchParams`, a URI string, a URL object, or a plain dictionary — all to the same `{ key: string }` shape. The returned dictionary has a `null` prototype, so an untrusted `__proto__` param becomes an inert own entry.
- `omitURIParam` is an alias for `omitURIParams()` with a single key.

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


## Functions

- [isURI](uri/isURI.md): Is an unknown value a URI object?
- [assertURI](uri/assertURI.md): Assert that an unknown value is a URI object.
- [getURI](uri/getURI.md): Convert a possible URI to a URI, or return undefined if conversion fails.
- [requireURI](uri/requireURI.md): Convert a possible URI to a URI, or throw RequiredError if conversion fails.
- [getURIParams](uri/getURIParams.md): Get a set of params for a URI as a dictionary.
- [getURIParam](uri/getURIParam.md): Get a single named param from a URI.
- [requireURIParam](uri/requireURIParam.md): Get a single named param from a URI.
- [withURIParam](uri/withURIParam.md): Return a URI with a new param set (or same URI if no changes were made).
- [withURIParams](uri/withURIParams.md): Return a URI with several new params set (or same URI if no changes were made).
- [omitURIParams](uri/omitURIParams.md): Return a URI without one or more params (or same URI if no changes were made).
- [clearURIParams](uri/clearURIParams.md): Return a URI with no search params (or same URI if no changes were made).

## Interfaces

- [ImmutableURIConstructor](uri/ImmutableURIConstructor.md): Construct a correctly-typed URI object.
- [ImmutableURI](uri/ImmutableURI.md): Object that describes a valid URI, e.g. urn:isbn:0451450523 or http://example.com/path/to/resource

## Types

- [URIString](uri/URIString.md): Valid URI string is anything following protocol:resource format, e.g. urn:isbn:0451450523 or http://example.com/path/to/resource
- [URISearch](uri/URISearch.md): String for the search component of a URI, including the leading ?
- [URIHash](uri/URIHash.md): String for the hash component of a URI, including the leading #
- [PossibleURI](uri/PossibleURI.md): Values that can be converted to an ImmutableURI instance.
- [URIParams](uri/URIParams.md): Type for a set of named URI parameters.
- [PossibleURIParams](uri/PossibleURIParams.md): Type for things that can be converted to named URI parameters.
- [URIScheme](uri/URIScheme.md): A single schema for a URL.
- [URISchemes](uri/URISchemes.md): List of allowed URI schemes.

## Constants

- [omitURIParam](uri/omitURIParam.md): Return a URI without a param (or same URI if no changes were made).
- [HTTP_SCHEMES](uri/HTTP_SCHEMES.md): Valid HTTP schemes for a URI.

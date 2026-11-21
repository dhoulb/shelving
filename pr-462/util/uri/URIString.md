# URIString

- Kind: type
- Import: `import { URIString } from "shelving/util/uri";`

Valid URI string is anything following `protocol:resource` format, e.g. `urn:isbn:0451450523` or `http://example.com/path/to/resource`

URI and URL differences:
- According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
- The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
- The absence of `//` indicates a non-hierarchical URI.
- URLs can be considered as "hierarchical URIs".
- All URLs are also URIs, but not all URIs are URLs.

## Signatures

```ts
`${string}:${string}`
```

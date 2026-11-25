# ImmutableURI

- Kind: interface
- Import: `import { ImmutableURI } from "shelving/util/uri";`
- Extends: `URL`

Object that describes a valid URI, e.g. `urn:isbn:0451450523` or `http://example.com/path/to/resource`
- Improves the builtin Javascript `URL` class to more accurately type its properties.

URI and URL differences:
- According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
- The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
- The absence of `//` indicates a non-hierarchical URI.
- URLs can be considered as "hierarchical URIs".
- All URLs are also URIs, but not all URIs are URLs.

## Signatures

```ts
{
	readonly hash: URIHash | ``;
	readonly host: string;
	readonly hostname: string;
	readonly href: URIString;
	readonly origin: URIString | `null`;
	readonly password: string;
	readonly pathname: string;
	readonly port: string;
	readonly protocol: URIScheme;
	readonly search: URISearch | ``;
	readonly username: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `hash` | `` URIHash \| `` `` | Hash component of the URI, including the leading `#` (empty string if absent). Read only. |
| `host` | `string` | Host component of the URI (hostname and port), or empty string for non-hierarchical URIs. Read only. |
| `hostname` | `string` | Hostname component of the URI, or empty string for non-hierarchical URIs. Read only. |
| `href` | `URIString` | Full URI string. Read only. |
| `origin` | `` URIString \| `null` `` | Origin of the URI, or the string `"null"` for origins that cannot be serialised. Read only. |
| `password` | `string` | Password component of the URI (empty string if absent). Read only. |
| `pathname` | `string` | Pathname component of the URI. Read only. |
| `port` | `string` | Port component of the URI (empty string if absent). Read only. |
| `protocol` | `URIScheme` | Protocol scheme of the URI, including the trailing `:` Read only. |
| `search` | `` URISearch \| `` `` | Search component of the URI, including the leading `?` (empty string if absent). Read only. |
| `username` | `string` | Username component of the URI (empty string if absent). Read only. |

# ImmutableURL

- Kind: interface
- Import: `import { ImmutableURL } from "shelving/util/url";`
- Extends: `ImmutableURI`

Object that describes a valid URL, e.g. `http://example.com/path/to/resource`
- Improves the builtin Javascript `URL` class to more accurately type its properties.

URI and URL differences:
- According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
- The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
- The absence of `//` indicates a non-hierarchical URI.
- URLs can be considered as "hierarchical URIs".
- All URLs are also URIs, but not all URIs are URLs.

Javascript URL problems:
- Javascript `URL` instance can actually represent any kind of URI (not just URLs).
- It's more "correct" terminology to use `URI` to refer to what the Javascript `URL` class represents.
- You can tell the difference because a URL will have a non-empty `host` property, whereas URIs will never have a `host` (it will be `""` empty string).
- Javascript URLs are mutable which can lead to subtle bugs.

## Signatures

```ts
{
	readonly href: URLString;
	readonly origin: URLString;
	readonly pathname: AbsolutePath;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `href` | `URLString` | Read only. |
| `origin` | `URLString` | Read only. |
| `pathname` | `AbsolutePath` | Read only. |

# URLString

- Kind: type
- Import: `import { URLString } from "shelving/util/url";`

A URL string has a protocol and a `//`.
- The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
- URLs have a concept of "absolute" or "relative" URLs, since they have a path.

## Signatures

```ts
`${string}://${string}`
```

# MetaLinks

- Kind: type
- Import: `import { MetaLinks } from "shelving/ui";`

Set of resolved meta `<link />` tags in `{ rel: href }` format (hrefs already absolutified to `ImmutableURI`).

## Signatures

```ts
ImmutableDictionary<ImmutableURI>
```

## Types

- [ImmutableDictionary](../util/dictionary/ImmutableDictionary.md): Readonly dictionary object.
- [ImmutableURI](../util/uri/ImmutableURI.md): Object that describes a valid URI, e.g. urn:isbn:0451450523 or http://example.com/path/to/resource

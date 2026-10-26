# ImmutableURIConstructor

- Kind: interface
- Import: `import { ImmutableURIConstructor } from "shelving/util/uri";`

Construct a correctly-typed `URI` object.
- This is a more correctly typed version of the builtin Javascript `URL` constructor.
- Takes a URI string or URI object that already encodes a complete URI — no base parameter, so relative inputs are not accepted.
- To resolve a relative input against a base, use `getBasedURI()` from `url.ts`.

## Signatures

```ts
{
	new (input: URIString | ImmutableURI): ImmutableURI;
}
```

# ImmutableURLConstructor

- Kind: interface
- Import: `import { ImmutableURLConstructor } from "shelving/util/url";`

Construct a correctly-typed `URL` object.
- This is a more correctly typed version of the builtin Javascript `URL` constructor.
- Requires a URL string, URL object, or path as input, and optionally a base URL.
- If a path is provided as input, a base URL _must_ also be provided.
- The returned type is `ImmutableURL`.

## Signatures

```ts
{
	new (input: URLString | ImmutableURL, base?: URLString | ImmutableURL): ImmutableURL;
	new (input: URLString | ImmutableURL | string, base: URLString | ImmutableURL): ImmutableURL;
}
```

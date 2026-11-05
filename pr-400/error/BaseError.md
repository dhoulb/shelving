# BaseError

- Kind: interface
- Import: `import { BaseError } from "shelving/error";`
- Extends: `Error`

An `Error` that provides additional helpful functionality.
- Carries arbitrary named contextual data alongside the standard `Error` fields.
- All concrete error classes in this module (`ValueError`, `RequiredError`, etc.) implement this shape.

## Signatures

```ts
{
	readonly [key: string]: unknown;
}
```

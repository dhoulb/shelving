# BaseErrorOptions

- Kind: interface
- Import: `import { BaseErrorOptions } from "shelving/error";`
- Extends: `globalThis.ErrorOptions`

Options for `BaseError` that provide additional helpful error functionality.
- Extends the built-in `ErrorOptions` (so `cause` is supported) and adds a `caller` plus arbitrary contextual fields.

## Signatures

```ts
{
	[key: string]: unknown;
	caller?: AnyCaller | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

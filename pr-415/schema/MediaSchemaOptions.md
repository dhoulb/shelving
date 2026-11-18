# MediaSchemaOptions

- Kind: interface
- Import: `import { MediaSchemaOptions } from "shelving/schema";`
- Extends: `FileSchemaOptions`

Allowed options for `MediaSchema`.

## Signatures

```ts
{
	readonly capture?: FileCapture | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `capture` | `FileCapture \| undefined` | Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. Read only. Optional. |

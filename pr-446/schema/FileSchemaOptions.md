# FileSchemaOptions

- Kind: interface
- Import: `import { FileSchemaOptions } from "shelving/schema";`
- Extends: `StringSchemaOptions`

Allowed options for `FileSchema`.

## Signatures

```ts
{
	readonly types?: FileTypes | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `types` | `FileTypes \| undefined` | Set of allowed file extensions; when set, the file name's extension must be one of these. Read only. Optional. |

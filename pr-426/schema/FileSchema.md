# FileSchema

- Kind: class
- Import: `import { FileSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that validates a file name matching one or more extensions.

- Requires the file name to have an extension.
- When `types` is set, the extension must be one of the allowed `FileTypes`.

## Signatures

```ts
new FileSchema({ one = "file", title = "File", types, ...options }: FileSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `FileSchemaOptions` |  |
| `.types` | `FileTypes \| undefined` | Set of allowed file extensions; when set, the file name's extension must be one of these. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `FileSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `types` | `FileTypes \| undefined` | Set of allowed file extensions; when set, the file name's extension must be one of these. Read only. |

## Examples

```ts
FILE.validate("photo.jpg"); // Returns "photo.jpg"
```

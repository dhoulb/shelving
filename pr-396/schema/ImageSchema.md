# ImageSchema

- Kind: class
- Import: `import { ImageSchema } from "shelving/schema";`
- Extends: `MediaSchema`

Schema that validates the file name of an image.

- The extension must be one of `types` (default `IMAGE_TYPES`).

## Signatures

```ts
new ImageSchema({ one = "image", title = "Image", types = IMAGE_TYPES, ...options }: MediaSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `MediaSchemaOptions` |  |
| `.capture` | `FileCapture \| undefined` | Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ImageSchema` |  |

# MediaSchema

- Kind: class
- Import: `import { MediaSchema } from "shelving/schema";`
- Extends: `FileSchema`

Schema that validates the file name of an image or a video.

- The extension must be one of `types` (default `MEDIA_TYPES`).
- `capture` tells a file picker to open the camera straight away.

## Signatures

```ts
new MediaSchema({ one = "media", title = "Media", types = MEDIA_TYPES, capture, ...options }: MediaSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `MediaSchemaOptions` |  |
| `.capture` | `FileCapture \| undefined` | Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `MediaSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `capture` | `FileCapture \| undefined` | Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. Read only. |

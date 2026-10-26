# VideoSchema

- Kind: class
- Import: `import { VideoSchema } from "shelving/schema";`
- Extends: `MediaSchema`

Schema that validates the file name of a video.

- The extension must be one of `types` (default `VIDEO_TYPES`).

## Signatures

```ts
new VideoSchema({ one = "video", title = "Video", types = VIDEO_TYPES, ...options }: MediaSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `MediaSchemaOptions` |  |
| `.capture` | `FileCapture \| undefined` | Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `VideoSchema` |  |

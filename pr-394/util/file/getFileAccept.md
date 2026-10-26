# getFileAccept()

- Kind: function
- Import: `import { getFileAccept } from "shelving/util/file";`

Get the `accept` attribute of a file input for a set of file types, e.g. `"image/jpeg,image/png"`.
- Each MIME type shows once, even when two extensions share it.

## Signatures

```ts
getFileAccept(types: FileTypes): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `types` | `FileTypes` | The allowed file types. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A comma-separated list of MIME types. |

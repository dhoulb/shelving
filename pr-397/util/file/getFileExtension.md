# getFileExtension()

- Kind: function
- Import: `import { getFileExtension } from "shelving/util/file";`

Get the file extension from a file path, e.g. `"md"`, or return `undefined` if the input has no extension.

## Signatures

```ts
getFileExtension(file: Nullish<string>): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `file` | `Nullish<string>` | The filename to read the extension from, or a nullish value. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The extension (no leading dot), or `undefined` if the input has no extension. |

# requireFileExtension()

- Kind: function
- Import: `import { requireFileExtension } from "shelving/util/file";`

Get the file extension from a file path e.g. `"tsx"`, or throw `RequiredError` if the input has no extension.

## Signatures

```ts
requireFileExtension(file: string, caller: AnyCaller = requireFileExtension): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `file` | `string` | The filename to read the extension from. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireFileExtension`). Defaults to `requireFileExtension`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The extension (no leading dot). |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if the input has no extension. |

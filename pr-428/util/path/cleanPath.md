# cleanPath()

- Kind: function
- Import: `import { cleanPath } from "shelving/util/path";`

Normalise a path.
- Runs of `/` and `\` collapsed to a single `/`.
- `.` "current-directory" segments dropped (so `./a/b` → `a/b`, `a/./b` → `a/b`, `.` → `""`).
- Trailing slashes stripped.
- The root `"/"` is preserved as-is.

## Signatures

```ts
cleanPath(path: AbsolutePath): AbsolutePath
cleanPath(path: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath` | The path to normalise. |
| `path` | `string` |  |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath` | The normalised path, preserving the absolute/relative type of `path`. |
| `string` |  |

# joinPath()

- Kind: function
- Import: `import { joinPath } from "shelving/util/path";`

Join one or more path parts into a single path string.
- Each part can be a string (e.g. `"/foo/bar"`, `"foo"`) or an array of segments (e.g. `["foo", "bar"]`). String parts may themselves contain `/` separators — they're flattened and normalised.
- Runs of `//` are collapsed and trailing slashes stripped (via `cleanPath()`); `\` Windows slashes are converted too.
- If the first argument is an `AbsolutePath` string (starts with `/`), the result is also an `AbsolutePath`; otherwise the return type is `string`.

## Signatures

```ts
joinPath(first: AbsolutePath, ...rest: PathPart[]): AbsolutePath
joinPath(...parts: PathPart[]): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `first` | `AbsolutePath` |  |
| `rest` | `PathPart[]` |  |
| `parts` | `PathPart[]` |  |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath` |  |
| `string` |  |

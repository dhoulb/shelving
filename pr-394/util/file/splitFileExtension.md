# splitFileExtension()

- Kind: function
- Import: `import { splitFileExtension } from "shelving/util/file";`

Split a filename into its base name and extension in a single pass.
- Extension with no leading dot, e.g. `"ts"`.
- Returns `undefined` for either part if the filename has no dot or starts with a dot only.

## Signatures

```ts
splitFileExtension(file: Nullish<string> = ""): [base: string | undefined, extension: string | undefined]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `file` | `Nullish<string>` | The filename to split, or a nullish value (defaults to `""`). Defaults to `""`. |

## Returns

| Type | Description |
| --- | --- |
| `[base: string \| undefined, extension: string \| undefined]` | A `[base, extension]` tuple, with `undefined` for either part that is absent. |

# splitPath()

- Kind: function
- Import: `import { splitPath } from "shelving/util/path";`

Get the "segments" in an absolute path.
- `splitPath("/")` returns `[]` — the root has no segments.

## Signatures

```ts
splitPath(path: PossiblePath): readonly string[]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `PossiblePath` | Path to split (an array of segments is returned as-is). |

## Returns

| Type | Description |
| --- | --- |
| `readonly string[]` | Array of path segments. |

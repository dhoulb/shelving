# splitDataPath()

- Kind: function
- Import: `import { splitDataPath } from "shelving/util/data";`

Split a dotted path into data path segments.
- A path that is already an array of segments is returned unchanged.

## Signatures

```ts
splitDataPath(path: BranchDataPath<T> | BranchDataSegments<T>): BranchDataSegments<T>
splitDataPath(path: LeafDataPath<T> | LeafDataSegments<T>): LeafDataSegments<T>
splitDataPath(path: string | Segments): Segments
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `BranchDataPath<T> \| BranchDataSegments<T>` | The dotted path string (e.g. `"a.b"`) or an array of segments. |
| `path` | `LeafDataPath<T> \| LeafDataSegments<T>` |  |
| `path` | `string \| Segments` |  |

## Returns

| Type | Description |
| --- | --- |
| `BranchDataSegments<T>` | The path as an array of segments. |
| `LeafDataSegments<T>` |  |
| `Segments` |  |

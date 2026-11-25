# joinDataPath()

- Kind: function
- Import: `import { joinDataPath } from "shelving/util/data";`

Join a set of data path segments into a dotted path string.
- A path that is already a dotted string is returned unchanged.

## Signatures

```ts
joinDataPath(path: BranchDataSegments<T> | BranchDataPath<T>): BranchDataPath<T>
joinDataPath(path: LeafDataSegments<T> | LeafDataPath<T>): LeafDataPath<T>
joinDataPath(path: Segments | string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `BranchDataSegments<T> \| BranchDataPath<T>` | An array of path segments, or an already-joined dotted path string. |
| `path` | `LeafDataSegments<T> \| LeafDataPath<T>` |  |
| `path` | `Segments \| string` |  |

## Returns

| Type | Description |
| --- | --- |
| `BranchDataPath<T>` | The path as a dotted string (e.g. `"a.b"`). |
| `LeafDataPath<T>` |  |
| `string` |  |

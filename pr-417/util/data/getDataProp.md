# getDataProp()

- Kind: function
- Import: `import { getDataProp } from "shelving/util/data";`

Get an optional (possibly deep) prop from a data object, or `undefined` if it doesn't exist.

## Signatures

```ts
getDataProp(data: T, path: K): BranchData<T>[K]
getDataProp(data: DeepPartial<T>, path: K): BranchData<T>[K] | undefined
getDataProp(data: Data, path: string | Segments): unknown
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `T` | The data object to read from. |
| `path` | `K` | The dotted path string (e.g. `"a.b"`) or an array of segments pointing at the prop. |
| `data` | `DeepPartial<T>` |  |
| `path` | `K` |  |
| `data` | `Data` |  |
| `path` | `string \| Segments` |  |

## Returns

| Type | Description |
| --- | --- |
| `BranchData<T>[K]` | The value at the path, or `undefined` if any segment along the path doesn't exist. |
| `BranchData<T>[K] \| undefined` |  |
| `unknown` |  |

# getDataProps()

- Kind: function
- Import: `import { getDataProps } from "shelving/util/data";`

Get the props of a data object as a set of entries.

## Signatures

```ts
getDataProps(data: T): ImmutableArray<DataProp<T>>
getDataProps(data: T | Partial<T>): ImmutableArray<DataProp<T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `T` | The data object to read. |
| `data` | `T \| Partial<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<DataProp<T>>` | An immutable array of `[key, value]` prop tuples. |
| `ImmutableArray<DataProp<T>>` |  |

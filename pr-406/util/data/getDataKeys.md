# getDataKeys()

- Kind: function
- Import: `import { getDataKeys } from "shelving/util/data";`

Get the keys of a data object as an array.

## Signatures

```ts
getDataKeys(data: T): ImmutableArray<DataKey<T>>
getDataKeys(data: T | Partial<T>): ImmutableArray<DataKey<T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `T` | The data object to read. |
| `data` | `T \| Partial<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<DataKey<T>>` | An immutable array of the object's string keys. |
| `ImmutableArray<DataKey<T>>` |  |

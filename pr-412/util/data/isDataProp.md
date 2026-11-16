# isDataProp()

- Kind: function
- Import: `import { isDataProp } from "shelving/util/data";`

Is an unknown value the key for an own prop of a data object?

## Signatures

```ts
isDataProp(data: T, key: unknown): key is DataKey<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `T` | The data object to check against. |
| `key` | `unknown` | The value to check as a key. |

## Returns

| Type | Description |
| --- | --- |
| `key is DataKey<T>` | `true` if `key` is an own string key of `data`, narrowing it to `DataKey<T>`. |

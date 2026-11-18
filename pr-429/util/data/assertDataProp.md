# assertDataProp()

- Kind: function
- Import: `import { assertDataProp } from "shelving/util/data";`

Assert that an unknown value is the key for an own prop of a data object.

## Signatures

```ts
assertDataProp(data: T, key: unknown, caller: AnyCaller = assertDataProp): asserts key is DataKey<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `T` | The data object to check against. |
| `key` | `unknown` | The value to check as a key. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `assertDataProp`). Defaults to `assertDataProp`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts key is DataKey<T>` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `key` is not an own key of `data`. |

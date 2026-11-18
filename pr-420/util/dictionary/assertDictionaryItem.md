# assertDictionaryItem()

- Kind: function
- Import: `import { assertDictionaryItem } from "shelving/util/dictionary";`

Assert that an unknown value is the key for an own prop of a dictionary.

## Signatures

```ts
assertDictionaryItem(dict: ImmutableDictionary<T>, key: string, caller: AnyCaller = assertDictionaryItem): asserts key is string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dict` | `ImmutableDictionary<T>` | The dictionary to assert against. |
| `key` | `string` | The key to assert is an own prop. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertDictionaryItem` itself). Defaults to `assertDictionaryItem`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts key is string` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `key` is not an own prop of `dict`. |

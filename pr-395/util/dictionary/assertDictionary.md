# assertDictionary()

- Kind: function
- Import: `import { assertDictionary } from "shelving/util/dictionary";`

Assert that an unknown value is a dictionary object.

## Signatures

```ts
assertDictionary(value: unknown, caller: AnyCaller = assertDictionary): asserts value is ImmutableDictionary
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertDictionary` itself). Defaults to `assertDictionary`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is ImmutableDictionary` |  |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `value` is not a dictionary object. |

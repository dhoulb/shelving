# assertBytes()

- Kind: function
- Import: `import { assertBytes } from "shelving/util/bytes";`

Assert that an unknown value is a `Uint8Array` byte sequence (optionally with a min/max length).

## Signatures

```ts
assertBytes(value: unknown, min = 0, max = Number.POSITIVE_INFINITY, caller: AnyCaller = assertBytes): asserts value is Bytes
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `min` | `unknown` | Minimum allowed length (defaults to `0`). Defaults to `0`. |
| `max` | `unknown` | Maximum allowed length (defaults to `Infinity`). Defaults to `Number.POSITIVE_INFINITY`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertBytes` itself). Defaults to `assertBytes`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is Bytes` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a byte sequence within the allowed length range. |

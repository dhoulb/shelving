# assertStringLength()

- Kind: function
- Import: `import { assertStringLength } from "shelving/util/string";`

Assert that a value is a string with a length between `min` and `max`.

## Signatures

```ts
assertStringLength(value: unknown, min?: number, max?: number, caller: AnyCaller = assertString): asserts value is string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert on. |
| `min` | `number` | The minimum allowed length. Optional. |
| `max` | `number` | The maximum allowed length. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertString`). Defaults to `assertString`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is string` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a string within the length bounds. |

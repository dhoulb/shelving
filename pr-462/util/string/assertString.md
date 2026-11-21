# assertString()

- Kind: function
- Import: `import { assertString } from "shelving/util/string";`

Assert that a value is a string.

## Signatures

```ts
assertString(value: unknown, caller: AnyCaller = assertString): asserts value is string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert on. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertString`). Defaults to `assertString`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is string` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a string. |

## Examples

```ts
assertString("a"); // Passes.
```

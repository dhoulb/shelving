# assertTrue()

- Kind: function
- Import: `import { assertTrue } from "shelving/util/boolean";`

Assert that an unknown value is exactly `true`.

## Signatures

```ts
assertTrue(value: unknown, caller: AnyCaller = assertTrue): asserts value is true
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertTrue` itself). Defaults to `assertTrue`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is true` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not the literal `true`. |

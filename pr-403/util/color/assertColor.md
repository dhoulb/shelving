# assertColor()

- Kind: function
- Import: `import { assertColor } from "shelving/util/color";`

Assert that an unknown value is a `Color` instance.

## Signatures

```ts
assertColor(value: unknown, caller: AnyCaller = assertColor): asserts value is Color
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertColor` itself). Defaults to `assertColor`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is Color` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `Color` instance. |

# assertDate()

- Kind: function
- Import: `import { assertDate } from "shelving/util/date";`

Assert that a value is a valid `Date` instance.

## Signatures

```ts
assertDate(value: unknown, caller: AnyCaller = assertDate): asserts value is Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `caller` | `AnyCaller` | The function to attribute a thrown error to (defaults to `assertDate`). Defaults to `assertDate`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is Date` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the value is not a valid `Date` instance. |

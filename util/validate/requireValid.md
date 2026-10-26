# requireValid()

- Kind: function
- Import: `import { requireValid } from "shelving/util/validate";`

Validate a value with a given validator, or throw `RequiredError` if the value could not be validated.

- String validation messages are wrapped in a `RequiredError`; non-string errors are rethrown as-is.

## Signatures

```ts
requireValid(value: unknown, validator: Validator<T>, caller: AnyCaller = requireValid): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The unsafe value to validate. |
| `validator` | `Validator<T>` | The validator to validate the value with. |
| `caller` | `AnyCaller` | Function to attribute the thrown error to (defaults to `requireValid`). Defaults to `requireValid`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The valid value. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if validation threw a string message. |
| `unknown` | `Error` if the validator throws a non-string error. |

# getValid()

- Kind: function
- Import: `import { getValid } from "shelving/util/validate";`

Validate a value with a given validator, or return `undefined` if the value could not be validated.

- Non-string thrown errors (i.e. real `Error` instances) are rethrown — only string validation messages are swallowed into `undefined`.

## Signatures

```ts
getValid(value: unknown, validator: Validator<T>): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The unsafe value to validate. |
| `validator` | `Validator<T>` | The validator to validate the value with. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The valid value, or `undefined` if validation threw a string message. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `Error` if the validator throws a non-string error. |

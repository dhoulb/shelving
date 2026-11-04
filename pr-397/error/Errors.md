# Errors

- Kind: class
- Import: `import { Errors } from "shelving/error";`
- Extends: `AggregateError`
- Implements: `BaseError`

Aggregate an array of errors into a single combined error.
- Extends (and shadows) the built-in `AggregateError` but with additional allowed options like `caller`.

## Signatures

```ts
new Errors(errors: Iterable<unknown>, message?: string, options: BaseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `errors` | `Iterable<unknown>` | Iterable of the individual errors being aggregated. |
| `message` | `string` | Optional human-readable message describing the aggregate failure. Optional. |
| `options` | `BaseErrorOptions` | Defaults to `{}`. |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `Errors` |  |

## Examples

```ts
throw new Errors([new ValueError("Bad name"), new ValueError("Bad age")], "Validation failed");
```

# UnexpectedError

- Kind: class
- Import: `import { UnexpectedError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Thrown when something is wrong or unexpected.
- Signals a logic or invariant failure that shouldn't normally happen, rather than a value or input problem.

Thrown when something that should never happen did — an invariant was violated or an unreachable code path was reached. Reaching an `UnexpectedError` means there is a bug, not a bad input.

## Usage

```ts
import { UnexpectedError } from "shelving/error";

function assertNever(x: never): never {
  throw new UnexpectedError("Unhandled case", { received: x });
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.


## Signatures

```ts
new UnexpectedError(message?: string, options: BaseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of the unexpected condition. Optional. |
| `options` | `BaseErrorOptions` | Defaults to `{}`. |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `UnexpectedError` |  |

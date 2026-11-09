# RequiredError

- Kind: class
- Import: `import { RequiredError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Thrown when something is required but not supplied.
- Usually thrown from `requireX()` functions, e.g. `requireString()` and `requireNumber()`.

Thrown when something required was absent — a missing argument, an empty lookup result, or an unset value. The `require*()` helpers — e.g. `requireString()` — throw this class.

## Usage

```ts
import { RequiredError } from "shelving/error";

function getUser(id: string | undefined): User {
  if (!id) throw new RequiredError("User ID is required");
  // ...
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.


## Signatures

```ts
new RequiredError(message?: string, options: BaseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of what was required but missing. Optional. |
| `options` | `BaseErrorOptions` | Defaults to `{}`. |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `RequiredError` |  |

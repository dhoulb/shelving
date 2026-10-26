# ValueError

- Kind: class
- Import: `import { ValueError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Thrown when a value is wrong or unexpected.
- Use for invalid runtime values; pass `received` / `expected` via `options` for context.

Thrown when a value was present but invalid in its context — for example data read from a database or an external source that failed validation. Pass the offending value as `received` so it appears in structured logs.

## Usage

```ts
import { ValueError } from "shelving/error";

function parseConfig(raw: unknown): Config {
  if (!isConfig(raw)) throw new ValueError("Invalid config from server", { received: raw });
  return raw;
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.


## Signatures

```ts
new ValueError(message?: string, options: BaseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of why the value is wrong. Optional. |
| `options` | `BaseErrorOptions` | Defaults to `{}`. |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ValueError` |  |

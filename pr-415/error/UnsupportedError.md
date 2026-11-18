# UnsupportedError

- Kind: class
- Import: `import { UnsupportedError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Error thrown when functionality is called but is not supported — by a backend, an environment, or an implementation.

Thrown when functionality is called but is not supported — a backend that can't run a type of operation (e.g. a key-value store asked to run a query), an environment missing a required capability (e.g. `localStorage` on the server), or an abstract method left for a subclass to override.

## Usage

```ts
import { UnsupportedError } from "shelving/error";

class KVProvider {
  getQuery(): Promise<Items> {
    throw new UnsupportedError("KVProvider does not support querying items");
  }
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.


## Signatures

```ts
new UnsupportedError(message?: string, options: BaseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of the unsupported functionality. Optional. |
| `options` | `BaseErrorOptions` | Defaults to `{}`. |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `UnsupportedError` |  |

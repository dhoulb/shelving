# MethodNotAllowedError

- Kind: class
- Import: `import { MethodNotAllowedError } from "shelving/error";`
- Extends: `RequestError`

Throw if a request uses an HTTP method that is not supported.
- Sets HTTP status `code` to `405`.

## Signatures

```ts
new MethodNotAllowedError(message?: string, options?: RequestErrorOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of the unsupported method. Optional. |
| `options` | `RequestErrorOptions` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `MethodNotAllowedError` |  |

## Examples

```ts
throw new MethodNotAllowedError("Use POST not GET");
```

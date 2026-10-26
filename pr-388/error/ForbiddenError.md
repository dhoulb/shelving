# ForbiddenError

- Kind: class
- Import: `import { ForbiddenError } from "shelving/error";`
- Extends: `RequestError`

Throw if an operation failed because the user is logged in, but does not have sufficient privileges to access this content.
- Sets HTTP status `code` to `403`.

## Signatures

```ts
new ForbiddenError(message?: string, options?: RequestErrorOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of the privilege failure. Optional. |
| `options` | `RequestErrorOptions` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ForbiddenError` |  |

## Examples

```ts
throw new ForbiddenError("Admins only");
```

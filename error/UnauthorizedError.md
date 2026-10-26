# UnauthorizedError

- Kind: class
- Import: `import { UnauthorizedError } from "shelving/error";`
- Extends: `RequestError`

Throw if an operation failed because the user is not logged in, or the login information is not well-formed.
- Sets HTTP status `code` to `401`.

## Signatures

```ts
new UnauthorizedError(message?: string, options?: RequestErrorOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of the authorization failure. Optional. |
| `options` | `RequestErrorOptions` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `UnauthorizedError` |  |

## Examples

```ts
throw new UnauthorizedError("Please log in");
```

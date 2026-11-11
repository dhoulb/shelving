# NotFoundError

- Kind: class
- Import: `import { NotFoundError } from "shelving/error";`
- Extends: `RequestError`

Throw if the requested content is not found.
- Sets HTTP status `code` to `404`.

## Signatures

```ts
new NotFoundError(message?: string, options?: RequestErrorOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of what was not found. Optional. |
| `options` | `RequestErrorOptions` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `NotFoundError` |  |

## Examples

```ts
throw new NotFoundError("User does not exist");
```

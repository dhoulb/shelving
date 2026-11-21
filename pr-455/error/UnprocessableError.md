# UnprocessableError

- Kind: class
- Import: `import { UnprocessableError } from "shelving/error";`
- Extends: `RequestError`

Throw when a request is valid and well-formed, but its actual data is not.
- Sets HTTP status `code` to `422`.

## Signatures

```ts
new UnprocessableError(message?: string, options?: RequestErrorOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of why the data could not be processed. Optional. |
| `options` | `RequestErrorOptions` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `UnprocessableError` |  |

## Examples

```ts
throw new UnprocessableError("Email address is invalid");
```

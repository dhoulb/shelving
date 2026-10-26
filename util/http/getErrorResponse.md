# getErrorResponse()

- Kind: function
- Import: `import { getErrorResponse } from "shelving/util/http";`

Get an HTTP `Response` for an unknown error value.

Returns the correct `Response` based on the type of error thrown:
- If `reason` is a `Response` instance, return it directly.
- If `reason` is a string, return a 422 response with the string message, e.g. `"Invalid input"`
- If `reason` is an `RequestError` instance, return a response with the error's message and code (but only if `debug` is true so we don't leak error details to the client).
- If `reason` is an `Error` instance, return a 500 response with the error's message (but only if `debug` is true so we don't leak error details to the client).
- Anything else returns a 500 response.

## Signatures

```ts
getErrorResponse(reason: unknown, debug = false): Response
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `reason` | `unknown` | The error value to convert to a `Response`. |
| `debug` | `unknown` | If `true` include the error message in the response (for debugging), or `false` to return generic error codes (for security). Defaults to `false`. Defaults to `false`. |

## Returns

| Type | Description |
| --- | --- |
| `Response` | A `Response` with a status code and (optionally) body derived from the error. |

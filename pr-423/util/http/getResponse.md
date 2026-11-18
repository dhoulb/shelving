# getResponse()

- Kind: function
- Import: `import { getResponse } from "shelving/util/http";`

Get an HTTP `Response` for an unknown value.
- A `Response` value is returned unchanged.
- `undefined` becomes a `204 No Content` response.
- Anything else becomes a `200` JSON response.

## Signatures

```ts
getResponse(value: unknown): Response
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert to a `Response`. |

## Returns

| Type | Description |
| --- | --- |
| `Response` | A `Response` with a 2xx status, and response body as JSON (if it was set), or no body if `value` is `undefined` |

# logRequestResponse()

- Kind: function
- Import: `import { logRequestResponse } from "shelving/util/log";`

Log a `Response` to a `Request` to the console.

## Signatures

```ts
logRequestResponse(response: Response, request: Request): Promise<void>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `response` | `Response` | The `Response` to log. |
| `request` | `Request` | The originating `Request`, included in the log for context. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<void>` | A promise that resolves once the response has been logged. |

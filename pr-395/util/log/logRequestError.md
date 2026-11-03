# logRequestError()

- Kind: function
- Import: `import { logRequestError } from "shelving/util/log";`

Log an `Error` from a `Request` to the console.

## Signatures

```ts
logRequestError(reason: unknown, request: Request): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `reason` | `unknown` | The error value to log. |
| `request` | `Request` | The originating `Request`, included in the log for context. |

## Returns

| Type | Description |
| --- | --- |
| `void` | Nothing. |

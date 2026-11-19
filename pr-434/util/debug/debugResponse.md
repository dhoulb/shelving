# debugResponse()

- Kind: function
- Import: `import { debugResponse } from "shelving/util/debug";`

Convert a `Response` into a one-line debug string.
- Shows the status code and status text only (no headers or body).

## Signatures

```ts
debugResponse(response: Response): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `response` | `Response` | The `Response` to debug. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A string in `status statusText` format. |

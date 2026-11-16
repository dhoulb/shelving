# ResponseError

- Kind: class
- Import: `import { ResponseError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Error thrown when a received HTTP response isn't OK.
- Carries the response's HTTP status `code` (defaults to `400`).

Thrown when a received response indicates an error — the HTTP 4xx/5xx range. Its `.code` property defaults to `400`. Use it for a response that arrived but was unsuccessful, as distinct from a transport failure (`NetworkError`).

## Usage

```ts
import { ResponseError } from "shelving/error";

function checkResponse(res: Response): void {
  if (!res.ok) throw new ResponseError(res.statusText, { code: res.status });
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.


## Signatures

```ts
new ResponseError(message?: string, { code = 400, ...options }: ResponseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of why the response was rejected. Optional. |
| `options` | `ResponseErrorOptions` | Defaults to `{}`. |

## Returns

| Type | Description |
| --- | --- |
| `ResponseError` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `code` | `number` | HTTP status code for the response. Read only. |

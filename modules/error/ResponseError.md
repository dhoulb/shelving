# ResponseError

Thrown when a received response indicates an error — the HTTP 4xx/5xx range. Its `.code` property defaults to `400`. Use it for a response that arrived but was unsuccessful, as distinct from a transport failure ([`NetworkError`](/error/NetworkError)).

## Usage

```ts
import { ResponseError } from "shelving/error";

function checkResponse(res: Response): void {
  if (!res.ok) throw new ResponseError(res.statusText, { code: res.status });
}
```

See [`shelving/error`](/error) for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

## See also

- [`NetworkError`](/error/NetworkError) — for a transport-level failure where no response arrived.
- [`RequestError`](/error/RequestError) — for a malformed or unacceptable incoming request.
- [`shelving/error`](/error) — module overview and shared error behaviour.

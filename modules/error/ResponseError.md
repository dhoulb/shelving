# ResponseError

Thrown when a received response indicates an error — the HTTP 4xx/5xx range. Its `.code` property defaults to `400`. Use it for a response that arrived but was unsuccessful, as distinct from a transport failure (`NetworkError`).

## Usage

```ts
import { ResponseError } from "shelving/error";

function checkResponse(res: Response): void {
  if (!res.ok) throw new ResponseError(res.statusText, { code: res.status });
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

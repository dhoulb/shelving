# RequestError

Thrown when an incoming request is malformed or unacceptable — the HTTP 4xx range. Its `.code` property defaults to `400`.

`RequestError` has named subclasses for common HTTP status codes, each setting its own `.code`: `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `MethodNotAllowedError` (405), and `UnprocessableError` (422). Throw the most specific class that fits.

## Usage

```ts
import { RequestError, NotFoundError } from "shelving/error";

function loadDocument(id: string): Document {
  if (!isValidId(id)) throw new RequestError("Malformed document ID", { received: id });
  const doc = documents.get(id);
  if (!doc) throw new NotFoundError("Document not found", { received: id }); // .code === 404
  return doc;
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

# RequestError

- Kind: class
- Import: `import { RequestError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Throw when a request isn't well-formed or is unacceptable in some way.
- Carries an HTTP-style `code` in the `400-499` client-error range (defaults to `400`).
- Base class for the specific request errors in this file (`UnauthorizedError`, `NotFoundError`, etc.).

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


## Signatures

```ts
new RequestError(message?: string, { code = 400, ...options }: RequestErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of why the request was rejected. Optional. |
| `options` | `RequestErrorOptions` | Defaults to `{}`. |

## Returns

| Type | Description |
| --- | --- |
| `RequestError` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `code` | `number` | HTTP status code for this error in the range `400-499`, defaults to `400`. Read only. |

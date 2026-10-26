# shelving/error

- Kind: module
- Import: `import { … } from "shelving/error";`

Typed error classes for system and transport failures.

## Concepts

Schema validation in shelving throws plain `string` values, not `Error` instances — form handlers consume those strings directly. The classes in this module are for a different layer: errors that represent infrastructure failures, bad requests, unexpected states, and programmer mistakes.

All classes extend `BaseError`, which itself extends `Error` with two additions:

- **Extra context fields.** Any key/value pairs passed in the options object (other than `cause` and `caller`) are attached directly to the error instance. Use `received` and `expected` as conventional field names when showing what went wrong.
- **`caller` trimming.** `Error.captureStackTrace` is called with the public-facing function or class as the `caller` argument, so the stack trace starts at the callsite rather than inside an internal helper.

Each subclass sets its own `caller` default, so you only need to supply `caller` explicitly when you are wrapping one of these classes inside your own public function.

```ts
function requirePositive(n: number): number {
  if (n <= 0) throw new ValueError("Value must be positive", {
    caller: requirePositive, // stack starts here, not inside ValueError
    received: n,
    expected: "> 0",
  });
  return n;
}
```

## Choosing the right class

| Class | When to throw |
|---|---|
| `RequiredError` | Something required was absent (also thrown by `require*()` helpers) |
| `ValueError` | A value was present but invalid in context (e.g. data from a database failed validation) |
| `NetworkError` | Network-level failure — connection refused, server unreachable |
| `RequestError` | The request was malformed or unacceptable (HTTP 4xx range; `RequestError.code` defaults to `400`) |
| `ResponseError` | The received response indicated an error (HTTP 4xx/5xx; `ResponseError.code` defaults to `400`) |
| `UnexpectedError` | Something that should never happen did — an invariant was violated |
| `UnsupportedError` | A method or feature is not supported — by a backend, an environment, or an implementation |

`RequestError` has named subclasses for common HTTP status codes: `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `MethodNotAllowedError` (405), and `UnprocessableError` (422).

See each class's own page for focused usage examples.

## Usage

### Attaching context

Any extra fields in the options bag land on the error instance and will appear in structured logs — this works the same way for every class in the module:

```ts
throw new ValueError("Unexpected status", {
  received: status,
  expected: ["active", "inactive"],
  entity: "subscription",
  cause: originalError,
});
```

### Catching by type

Every class participates in `instanceof` checks, and subclasses match their base class — so a `catch` block can branch from specific to general:

```ts
import { NotFoundError, ResponseError } from "shelving/error";

try {
  await loadDocument(id);
} catch (err) {
  if (err instanceof NotFoundError) return null;
  if (err instanceof ResponseError) reportHttpError(err.code, err.message);
  throw err;
}
```


## Functions

- [setBaseErrorOptions()](error/setBaseErrorOptions.md): Apply BaseErrorOptions to an error instance by copying contextual fields onto it and trimming its stack.

## Classes

- [Errors](error/Errors.md): Aggregate an array of errors into a single combined error.
- [NetworkError](error/NetworkError.md): Thrown in the event of network issues e.g. the user's internet connection is down, or the server is down.
- [RequestError](error/RequestError.md): Throw when a request isn't well-formed or is unacceptable in some way.
- [UnauthorizedError](error/UnauthorizedError.md): Throw if an operation failed because the user is not logged in, or the login information is not well-formed.
- [NotFoundError](error/NotFoundError.md): Throw if the requested content is not found.
- [UnprocessableError](error/UnprocessableError.md): Throw when a request is valid and well-formed, but its actual data is not.
- [ForbiddenError](error/ForbiddenError.md): Throw if an operation failed because the user is logged in, but does not have sufficient privileges to access this content.
- [MethodNotAllowedError](error/MethodNotAllowedError.md): Throw if a request uses an HTTP method that is not supported.
- [RequiredError](error/RequiredError.md): Thrown when something is required but not supplied.
- [ResponseError](error/ResponseError.md): Error thrown when a received HTTP response isn't OK.
- [UnexpectedError](error/UnexpectedError.md): Thrown when something is wrong or unexpected.
- [UnsupportedError](error/UnsupportedError.md): Error thrown when functionality is called but is not supported — by a backend, an environment, or an implementation.
- [ValueError](error/ValueError.md): Thrown when a value is wrong or unexpected.

## Interfaces

- [BaseErrorOptions](error/BaseErrorOptions.md): Options for BaseError that provide additional helpful error functionality.
- [BaseError](error/BaseError.md): An Error that provides additional helpful functionality.

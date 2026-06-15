# error

Typed error classes for system and transport failures.

## Concepts

Schema validation in shelving throws plain `string` values, not `Error` instances — form handlers consume those strings directly. The classes in this module are for a different layer: errors that represent infrastructure failures, bad requests, unexpected states, and programmer mistakes.

All classes extend [`BaseError`](/error/BaseError), which itself extends `Error` with two additions:

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
| [`RequiredError`](/error/RequiredError) | Something required was absent (also thrown by `require*()` helpers) |
| [`ValueError`](/error/ValueError) | A value was present but invalid in context (e.g. data from a database failed validation) |
| [`NetworkError`](/error/NetworkError) | Network-level failure — connection refused, server unreachable |
| [`RequestError`](/error/RequestError) | The request was malformed or unacceptable (HTTP 4xx range; [`.code`](/error/RequestError/code) defaults to `400`) |
| [`ResponseError`](/error/ResponseError) | The received response indicated an error (HTTP 4xx/5xx; [`.code`](/error/ResponseError/code) defaults to `400`) |
| [`UnexpectedError`](/error/UnexpectedError) | Something that should never happen did — an invariant was violated |
| [`UnimplementedError`](/error/UnimplementedError) | A method or feature is not implemented, e.g. in a provider stub |

`RequestError` has named subclasses for common HTTP status codes: [`UnauthorizedError`](/error/UnauthorizedError) (401), [`ForbiddenError`](/error/ForbiddenError) (403), [`NotFoundError`](/error/NotFoundError) (404), [`MethodNotAllowedError`](/error/MethodNotAllowedError) (405), and [`UnprocessableError`](/error/UnprocessableError) (422).

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

## See also

- [`schema`](/schema) — schema validation (throws plain strings, not Error instances)
- [`util`](/util/null) — `require*()` functions that throw [`RequiredError`](/error/RequiredError)

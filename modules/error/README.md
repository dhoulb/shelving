# error

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

## Usage

### Choosing the right class

| Class | When to throw |
|---|---|
| `RequiredError` | Something required was absent (also thrown by `require*()` helpers) |
| `ValueError` | A value was present but invalid in context (e.g. data from a database failed validation) |
| `NetworkError` | Network-level failure — connection refused, server unreachable |
| `RequestError` | The request was malformed or unacceptable (HTTP 4xx range; `.code` defaults to `400`) |
| `ResponseError` | The received response indicated an error (HTTP 4xx/5xx; `.code` defaults to `400`) |
| `UnexpectedError` | Something that should never happen did — an invariant was violated |
| `UnimplementedError` | A method or feature is not implemented, e.g. in a provider stub |

`RequestError` has named subclasses for common HTTP status codes: `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `MethodNotAllowedError` (405), and `UnprocessableError` (422).

### Basic usage

```ts
import {
  RequiredError,
  ValueError,
  NetworkError,
  NotFoundError,
  ResponseError,
  UnexpectedError,
  UnimplementedError,
} from "shelving/error";

// Something required is missing.
function getUser(id: string | undefined): User {
  if (!id) throw new RequiredError("User ID is required");
  // ...
}

// A value from an external source failed validation.
function parseConfig(raw: unknown): Config {
  if (!isConfig(raw)) throw new ValueError("Invalid config from server", { received: raw });
  return raw;
}

// Network or transport failure.
async function fetchData(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw new NetworkError("Could not reach server");
  }
}

// HTTP error response.
function checkResponse(res: Response): void {
  if (!res.ok) throw new ResponseError(res.statusText, { code: res.status });
}

// Guard against code paths that should be unreachable.
function assertNever(x: never): never {
  throw new UnexpectedError("Unhandled case", { received: x });
}

// Stub out a method that must be overridden.
class BaseProvider {
  save(): Promise<void> {
    throw new UnimplementedError("save() is not implemented");
  }
}
```

### Attaching context

Any extra fields in the options bag land on the error instance and will appear in structured logs:

```ts
throw new ValueError("Unexpected status", {
  received: status,
  expected: ["active", "inactive"],
  entity: "subscription",
  cause: originalError,
});
```

### Catching by type

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

- [schema](../schema/README.md) — schema validation (throws plain strings, not Error instances)
- [util](../util/README.md) — `require*()` functions that throw `RequiredError`

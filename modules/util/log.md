# Request logging helpers

Three thin wrappers around `console.log`/`console.error` that format HTTP `Request` and `Response` objects with ANSI arrow decorators. Intended for server-side request logging in development and production.

## Usage

```ts
import { logRequest, logRequestResponse, logRequestError } from "shelving/util";

// Log an incoming request (arrow pointing right →).
await logRequest(request);

// Log the response alongside its originating request (arrow pointing left ←).
await logRequestResponse(response, request);

// Log an error that occurred while handling a request (failure marker).
logRequestError(error, request);
```

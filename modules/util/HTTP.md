# HTTP helpers

Typed utilities for building and parsing `Request` and `Response` objects using the standard Fetch API. The helpers handle content-type negotiation, body serialisation, and error-to-response conversion so you don't have to repeat that logic in every endpoint or client.

**Things to know:**

- `createRequest` is the smart constructor — it inspects the payload type and picks the right content type automatically. Use the specific `createJSONRequest`, `createTextRequest`, etc. when you need explicit control.
- `GET` and `HEAD` requests cannot carry a body. Pass a `Data` object as the payload and it becomes `?query` params; anything else throws `RequiredError`.
- `getErrorResponse(reason, debug)` never leaks error details by default — pass `debug: true` only in development.
- `mergeRequestOptions` merges headers by key and combines two `AbortSignal`s so either one cancels the request.

## Usage

### Creating requests

```ts
import { createRequest, createJSONRequest, createHeadRequest } from "shelving/util";

// Smart constructor — picks content type from payload.
createRequest("POST", "https://api.example.com/items", { name: "Widget" });
createRequest("GET",  "https://api.example.com/items", { status: "active" });
// GET → appends ?status=active to URL

// Explicit JSON request.
createJSONRequest("PUT", "https://api.example.com/items/1", { name: "Widget" });

// Body-less GET with query params.
createHeadRequest("GET", "https://api.example.com/search", { q: "hello" });
```

### Parsing request and response bodies

```ts
import { parseRequestBody, parseRequestJSON, parseResponseBody } from "shelving/util";

// In a server handler:
const body = await parseRequestBody(request); // respects Content-Type
const json = await parseRequestJSON(request); // always expects JSON

// After fetch():
const data = await parseResponseBody(response);
```

### Building responses

```ts
import { getResponse, getErrorResponse } from "shelving/util";

// In a request handler:
return getResponse({ id: "1", name: "Widget" }); // 200 with JSON body
return getResponse(undefined);                    // 204 No Content

// In a catch block:
return getErrorResponse(error);           // 500, no details
return getErrorResponse(error, true);     // 500, includes message in dev
```

### Merging request options

```ts
import { mergeRequestOptions } from "shelving/util";

const defaults = { headers: { Authorization: "Bearer token" }, credentials: "include" };
const overrides = { headers: { "X-Request-ID": "abc" }, signal: controller.signal };

const merged = mergeRequestOptions(defaults, overrides);
// headers: { Authorization: "Bearer token", "X-Request-ID": "abc" }
```

## See also

- [util](/util) — full util module overview.

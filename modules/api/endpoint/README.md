# Endpoints

Declarative, typed descriptions of API routes. An [`Endpoint`](/api/Endpoint) captures an HTTP method, a path (with optional `{placeholder}` segments), a payload schema, and a result schema. Define endpoints once; use them on both client and server.

## Concepts

### Endpoint definitions

[`Endpoint<P, R>`](/api/Endpoint) holds everything needed to build a request and validate its response. Factory functions create endpoints concisely:

| Factory | HTTP method |
|---|---|
| [`GET(path, payload, result)`](/api/GET) | GET |
| [`POST(path, payload, result)`](/api/POST) | POST |
| [`PUT(path, payload, result)`](/api/PUT) | PUT |
| [`PATCH(path, payload, result)`](/api/PATCH) | PATCH |
| [`DELETE(path, payload, result)`](/api/DELETE) | DELETE |
| [`HEAD(path, payload, result)`](/api/HEAD) | HEAD |

All three arguments are optional. Omit `payload` or `result` to get `undefined` typed fields.

### Path placeholders

Paths may contain `{placeholder}` segments. When the provider builds a request, matching payload keys are substituted into the path. For `GET` and `HEAD`, remaining payload keys become `?query` params. For all other methods, remaining keys go into the JSON body.

```ts
import { GET, POST, DELETE } from "shelving/api"
import { STRING, NUMBER, BOOLEAN, DATA } from "shelving/schema"

// Payload field `id` fills the {id} placeholder; no query params.
const getUser = GET("/users/{id}", DATA({ id: STRING }), DATA({ name: STRING, email: STRING }))

// Extra payload fields go to the body.
const createUser = POST("/users", DATA({ name: STRING, email: STRING }), DATA({ id: STRING }))

// Payload-free endpoint.
const deleteUser = DELETE("/users/{id}", DATA({ id: STRING }))
```

### Server-side handler wiring

[`.handler(callback)`](/api/Endpoint/handler) pairs an endpoint with an implementation. Pass the resulting [`EndpointHandler`](/api/EndpointHandler) objects to [`handleEndpoints()`](/api/handleEndpoints), which matches an incoming `Request` against the list, validates the payload, invokes the callback, and returns a `Response`.

```ts
import { handleEndpoints } from "shelving/api"

const handlers = [
  getUser.handler(async ({ id }, _request, ctx) => ctx.db.users.get(id)),
  createUser.handler(async ({ name, email }, _request, ctx) => ctx.db.users.create({ name, email })),
]

// Cloudflare Worker (or any fetch-based runtime):
export default {
  fetch(request: Request, env: Env) {
    return handleEndpoints("https://api.example.com", handlers, request, { db: env.db })
  },
}
```

`handleEndpoints` strips the base URL path prefix before matching, so it works behind a sub-path mount. It throws [`NotFoundError`](/error/NotFoundError) if no handler matches and [`MethodNotAllowedError`](/error/MethodNotAllowedError) for unsupported methods.

### Callback signature

```ts
type EndpointCallback<P, R, C = void> =
  (payload: P, request: Request, context: C) => R | Response | Promise<R | Response>
```

Return `R` to let [`handleEndpoints()`](/api/handleEndpoints) validate and serialise the result, or return a raw `Response` to bypass serialisation entirely.

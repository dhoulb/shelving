# api

Typed, provider-based framework for HTTP API access. Define your routes as `Endpoint` definitions, then call them through a composable provider stack — the same pattern the [`db`](../db/README.md) module uses for databases.

## Concepts

### Endpoint

An `Endpoint` is a declarative, typed description of a single API route. It captures the HTTP method, the URL path (with optional `{placeholder}` segments), a [schema](../schema/README.md) for the request payload, and a schema for the response. Think of it the way [`Collection`](../db/README.md) describes a database table — a shared definition both client and server reference.

Factory functions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`) create endpoints concisely:

```ts
import { GET, POST } from "shelving/api"
import { STRING, NUMBER } from "shelving/schema"

const getUser = GET("/users/{id}", { id: STRING }, { name: STRING, age: NUMBER })
const createPost = POST("/posts", { title: STRING, body: STRING }, { id: STRING })
```

For `GET` and `HEAD` requests, payload fields that don't fill a `{placeholder}` are appended as `?query` params. All other methods send a JSON body.

### Providers

An `APIProvider` is the interface for executing a fetch against an endpoint. The base `APIProvider` uses the global `fetch` API. Wrap it with `ThroughAPIProvider` subclasses to layer in behaviour without rewriting transport logic:

| Provider | Purpose |
|---|---|
| `APIProvider` | Base provider — builds and sends requests with `fetch` |
| `ThroughAPIProvider` | Pass-through base for wrapping another provider |
| `ValidationAPIProvider` | Validates payload and result against endpoint schemas |
| `DebugAPIProvider` | Logs fetch attempts, results, and errors to the console |
| `JSONAPIProvider` | Forces JSON request bodies and JSON response parsing |
| `MockAPIProvider` | Records calls without sending network requests |
| `MockEndpointAPIProvider` | Dispatches calls through handler objects (useful for unit tests) |
| `XMLAPIProvider` | Forces XML request bodies and returns raw text responses |

Extend `ThroughAPIProvider` to add custom behaviour such as auth headers:

```ts
import { ThroughAPIProvider } from "shelving/api"

class AuthAPIProvider extends ThroughAPIProvider {
  constructor(source: APIProvider, readonly token: string) { super(source) }
  override fetch(endpoint, payload, options) {
    return super.fetch(endpoint, payload, {
      ...options,
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }
}
```

### Caching

`APICache` manages `EndpointCache` objects, one per endpoint. Each `EndpointCache` manages `EndpointStore` objects, one per unique payload — keyed by the rendered URL. For `GET`/`HEAD` requests, query params are part of the key so `?role=admin` and `?role=editor` are stored separately. `EndpointStore` fetches automatically on first read and de-duplicates in-flight requests.

The cache is primarily useful as the backbone of the [React integration](#react-integration). Use it directly only when you need a reactive layer outside React.

## Usage

### Define endpoints and fetch directly

```ts
import { GET, POST, APIProvider, ValidationAPIProvider } from "shelving/api"
import { DATA, STRING } from "shelving/schema"

const UserSchema = DATA({ id: STRING, name: STRING, email: STRING })
const getUser    = GET("/users/{id}", { id: STRING }, UserSchema)
const createUser = POST("/users", { name: STRING, email: STRING }, UserSchema)

const provider = new ValidationAPIProvider(new APIProvider({ url: "https://api.example.com" }))

const user    = await provider.fetch(getUser, { id: "u_123" })
const created = await provider.fetch(createUser, { name: "Alice", email: "alice@example.com" })
```

### Server-side routing

```ts
import { handleEndpoints } from "shelving/api"

const handlers = [
  getUser.handler(({ id }) => db.users.get(id)),
  createUser.handler(({ name, email }) => db.users.create({ name, email })),
]

// In a Cloudflare Worker or similar:
export default {
  fetch(request: Request) {
    return handleEndpoints("https://api.example.com", handlers, request)
  },
}
```

### Testing with `MockEndpointAPIProvider`

Wires your handler array directly into a mock transport so you can test client and server code together without a real network:

```ts
import { MockEndpointAPIProvider } from "shelving/api"

const api = new MockEndpointAPIProvider(handlers, { context: undefined })
const user = await api.fetch(getUser, { id: "u_123" })
```

## React integration

The [`react`](../react/README.md) module's `createAPIContext()` is the primary way to use a provider in a React app. It creates a context backed by an `APICache` and exposes typed hooks — `useEndpoint()`, `useProvider()` — that return reactive `EndpointStore` instances and suspend automatically while loading.

```ts
import { createAPIContext } from "shelving/react"
import { APIProvider, ValidationAPIProvider } from "shelving/api"

const provider = new ValidationAPIProvider(new APIProvider({ url: "https://api.example.com" }))
export const { APIContext, useEndpoint } = createAPIContext(provider)
```

See the [`react`](../react/README.md) module for full usage.

## See also

- [`schema`](../schema/README.md) — schemas for endpoint payload and result validation
- [`db`](../db/README.md) — the parallel database provider module
- [`store`](../store/README.md) — `Store` base class that `EndpointStore` extends
- [`react`](../react/README.md) — `createAPIContext()` for React integration

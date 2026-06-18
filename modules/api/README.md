# api

Typed, provider-based framework for HTTP API access. Define your routes as [`Endpoint`](/api/Endpoint) definitions, then call them through a composable provider stack — the same pattern the [`shelving/db`](/db) module uses for databases.

## Concepts

### Endpoint

An [`Endpoint`](/api/Endpoint) is a declarative, typed description of a single API route. It captures the HTTP method, the URL path (with optional `{placeholder}` segments), a [`shelving/schema`](/schema) for the request payload, and a schema for the response. Think of it the way [`Collection`](/db/Collection) describes a database table — a shared definition both client and server reference.

Factory functions ([`GET()`](/api/GET), [`POST()`](/api/POST), [`PUT()`](/api/PUT), [`PATCH()`](/api/PATCH), [`DELETE()`](/api/DELETE), [`HEAD()`](/api/HEAD)) create endpoints concisely:

```ts
import { GET, POST } from "shelving/api"
import { STRING, NUMBER } from "shelving/schema"

const getUser = GET("/users/{id}", { id: STRING }, { name: STRING, age: NUMBER })
const createPost = POST("/posts", { title: STRING, body: STRING }, { id: STRING })
```

For `GET` and `HEAD` requests, payload fields that don't fill a `{placeholder}` are appended as `?query` params. All other methods send a JSON body.

### Providers

An [`APIProvider`](/api/APIProvider) is the abstract interface for executing calls against endpoints. [`ClientAPIProvider`](/api/ClientAPIProvider) is the concrete implementation that uses the global `fetch` API. Wrap it with [`ThroughAPIProvider`](/api/ThroughAPIProvider) subclasses to layer in behaviour without rewriting transport logic:

| Provider | Purpose |
|---|---|
| [`ClientAPIProvider`](/api/ClientAPIProvider) | Concrete base — sends requests over the network with `fetch()` |
| [`ThroughAPIProvider`](/api/ThroughAPIProvider) | Pass-through base for wrapping another provider |
| [`ValidationAPIProvider`](/api/ValidationAPIProvider) | Validates payload and result against endpoint schemas |
| [`DebugAPIProvider`](/api/DebugAPIProvider) | Logs fetch attempts, results, and errors to the console |
| [`JSONAPIProvider`](/api/JSONAPIProvider) | Forces JSON request bodies and JSON response parsing |
| [`MockAPIProvider`](/api/MockAPIProvider) | Records calls without sending network requests |
| [`MockEndpointAPIProvider`](/api/MockEndpointAPIProvider) | Dispatches calls through handler objects (useful for unit tests) |
| [`XMLAPIProvider`](/api/XMLAPIProvider) | Forces XML request bodies and returns raw text responses |

Extend `ThroughAPIProvider` to add custom behaviour such as auth headers:

```ts
import { ThroughAPIProvider } from "shelving/api"

class AuthAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
  constructor(source: APIProvider<P, R>, readonly token: string) { super(source) }
  override fetch(request: Request): Promise<Response> {
    return super.fetch(new Request(request, {
      headers: { ...Object.fromEntries(request.headers), Authorization: `Bearer ${this.token}` },
    }))
  }
}
```

### Caching

[`APICache`](/api/APICache) manages [`EndpointCache`](/api/EndpointCache) objects, one per endpoint. Each `EndpointCache` manages [`EndpointStore`](/api/EndpointStore) objects, one per unique payload — keyed by the rendered URL. For `GET`/`HEAD` requests, query params are part of the key so `?role=admin` and `?role=editor` are stored separately. `EndpointStore` fetches automatically on first read and de-duplicates in-flight requests.

The cache is primarily useful as the backbone of the [React integration](#react-integration). Use it directly only when you need a reactive layer outside React.

## Usage

### Define endpoints and fetch directly

```ts
import { GET, POST, ClientAPIProvider, ValidationAPIProvider } from "shelving/api"
import { DATA, STRING } from "shelving/schema"

const UserSchema = DATA({ id: STRING, name: STRING, email: STRING })
const getUser    = GET("/users/{id}", DATA({ id: STRING }), UserSchema)
const createUser = POST("/users", DATA({ name: STRING, email: STRING }), UserSchema)

const provider = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }))

const user    = await provider.call(getUser, { id: "u_123" })
const created = await provider.call(createUser, { name: "Alice", email: "alice@example.com" })
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

const api = new MockEndpointAPIProvider(handlers, undefined)
const user = await api.call(getUser, { id: "u_123" })
```

## React integration

The [`shelving/react`](/react) module's [`createAPIContext()`](/react/createAPIContext) is the primary way to use a provider in a React app. It creates a context backed by an [`APICache`](/api/APICache) and exposes a typed [`.useAPI()`](/react/APIContext/useAPI) hook that returns reactive [`EndpointStore`](/api/EndpointStore) instances and suspends automatically while loading.

```ts
import { createAPIContext } from "shelving/react"
import { ClientAPIProvider, ValidationAPIProvider } from "shelving/api"

const provider = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }))
export const { APIContext, useAPI } = createAPIContext(provider)
```

See the [`shelving/react`](/react) module for full usage.

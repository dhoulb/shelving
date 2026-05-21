# Providers

The transport layer for API calls. A provider builds requests, sends them, and parses responses. Providers are composable wrappers — stack them to add validation, logging, caching, or mocking without touching transport logic.

## Concepts

### Provider hierarchy

`APIProvider` is the abstract base class. `ClientAPIProvider` is the concrete network implementation. All wrapper providers extend `ThroughAPIProvider`, which delegates every method to a `source` provider.

| Provider | Role |
|---|---|
| `ClientAPIProvider` | Sends requests over the network with `fetch()`. Accepts `{ url, options, timeout }`. |
| `ThroughAPIProvider` | Pass-through base — extend this to intercept only the methods you need. |
| `ValidationAPIProvider` | Validates payload before request creation and result after response parsing. |
| `LoggingAPIProvider` | Logs requests, responses, and errors using configurable callbacks (production-safe). |
| `DebugAPIProvider` | Verbose console output including full request/response bodies — development only. |
| `JSONAPIProvider` | Forces JSON request bodies and always parses responses as JSON. |
| `XMLAPIProvider` | Sends XML request bodies and returns raw text responses. |
| `MockAPIProvider` | Intercepts fetches through a `RequestHandler`; records all calls. No network requests. |
| `MockEndpointAPIProvider` | Routes mock fetches through a real `EndpointHandler` array — test client and server together. |
| `CachedAPIProvider` | Serves calls through an `APICache` and exposes `invalidate`/`refresh` helpers. |

### Building a provider chain

```ts
import { ClientAPIProvider, ValidationAPIProvider, LoggingAPIProvider } from "shelving/api"

const provider = new LoggingAPIProvider(
  new ValidationAPIProvider(
    new ClientAPIProvider({ url: "https://api.example.com", timeout: 10_000 })
  )
)

const user = await provider.call(getUser, { id: "u_123" })
```

Wrap outermost to innermost: `LoggingAPIProvider` sees every call first, `ValidationAPIProvider` validates next, `ClientAPIProvider` sends last.

### Custom provider

Extend `ThroughAPIProvider` to inject auth headers or any other per-request behaviour:

```ts
import { ThroughAPIProvider } from "shelving/api"

class AuthAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
  constructor(source: APIProvider<P, R>, readonly token: string) { super(source) }

  override fetch(request: Request): Promise<Response> {
    const authed = new Request(request, {
      headers: { ...Object.fromEntries(request.headers), Authorization: `Bearer ${this.token}` },
    })
    return super.fetch(authed)
  }
}
```

### Testing with MockAPIProvider and MockEndpointAPIProvider

`MockAPIProvider` captures all calls and routes fetches through a `RequestHandler` instead of the network. `MockEndpointAPIProvider` goes further — it wires the mock transport directly to a real handler array, so client and server code run together in a single process:

```ts
import { MockEndpointAPIProvider } from "shelving/api"

const handlers = [
  getUser.handler(async ({ id }) => ({ id, name: "Alice", email: "alice@example.com" })),
]

const api = new MockEndpointAPIProvider(handlers, undefined)
const user = await api.call(getUser, { id: "u_1" })
// user == { id: "u_1", name: "Alice", email: "alice@example.com" }

console.log(api.requestCalls) // inspect recorded calls
```

### `CachedAPIProvider`

Wraps any provider with an `APICache` so repeated calls for the same endpoint+payload skip the network. Exposes `invalidate`, `invalidateAll`, `refresh`, and `refreshAll` for cache control:

```ts
import { CachedAPIProvider, ValidationAPIProvider, ClientAPIProvider } from "shelving/api"

const provider = new CachedAPIProvider(
  new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }))
)

await provider.call(getUser, { id: "u_1" }) // fetches
await provider.call(getUser, { id: "u_1" }) // returns cached

provider.invalidate(getUser, { id: "u_1" }) // mark stale
provider.refresh(getUser, { id: "u_1" })    // re-fetch eagerly
```

## See also

- [api](/api) — parent module overview
- [api/endpoint](/api/endpoint) — endpoint definitions and handler wiring
- [api/cache](/api/cache) — `APICache` and `EndpointCache` used internally
- [schema](/schema) — `Schema<T>` used by `ValidationAPIProvider`
- [react](/react) — `createAPIContext()` for React integration

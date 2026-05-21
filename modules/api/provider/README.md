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
| `JSONAPIProvider` | A `ClientAPIProvider` that forces JSON request bodies and always parses responses as JSON. |
| `XMLAPIProvider` | A `ClientAPIProvider` that sends XML request bodies and returns raw text responses. |
| `MockAPIProvider` | Intercepts fetches through a `RequestHandler`; records all calls. No network requests. |
| `MockEndpointAPIProvider` | Routes mock fetches through a real `EndpointHandler` array — test client and server together. |
| `CachedAPIProvider` | Serves calls through an `APICache` and exposes `invalidate` / `refresh` helpers. |

Each provider has its own page with focused usage examples.

### Building a provider chain

Wrap outermost to innermost — the outer provider sees every call first:

```ts
import { ClientAPIProvider, ValidationAPIProvider, LoggingAPIProvider } from "shelving/api"

const provider = new LoggingAPIProvider(
  new ValidationAPIProvider(
    new ClientAPIProvider({ url: "https://api.example.com", timeout: 10_000 })
  )
)

const user = await provider.call(getUser, { id: "u_123" })
```

`LoggingAPIProvider` sees every call first, `ValidationAPIProvider` validates next, `ClientAPIProvider` sends last.

## See also

- [api](/api) — parent module overview
- [api/endpoint](/api/endpoint) — endpoint definitions and handler wiring
- [api/cache](/api/cache) — `APICache` and `EndpointCache` used internally
- [schema](/schema) — `Schema<T>` used by `ValidationAPIProvider`
- [react](/react) — `createAPIContext()` for React integration

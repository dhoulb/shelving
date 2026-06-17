# Providers

The transport layer for API calls. A provider builds requests, sends them, and parses responses. Providers are composable wrappers — stack them to add validation, logging, caching, or mocking without touching transport logic.

## Concepts

### Provider hierarchy

[`APIProvider`](/api/APIProvider) is the abstract base class. [`ClientAPIProvider`](/api/ClientAPIProvider) is the concrete network implementation. All wrapper providers extend [`ThroughAPIProvider`](/api/ThroughAPIProvider), which delegates every method to a `source` provider.

| Provider | Role |
|---|---|
| [`ClientAPIProvider`](/api/ClientAPIProvider) | Sends requests over the network with `fetch()`. Accepts `{ url, options, timeout }`. |
| [`ThroughAPIProvider`](/api/ThroughAPIProvider) | Pass-through base — extend this to intercept only the methods you need. |
| [`ValidationAPIProvider`](/api/ValidationAPIProvider) | Validates payload before request creation and result after response parsing. |
| [`LoggingAPIProvider`](/api/LoggingAPIProvider) | Logs requests, responses, and errors using configurable callbacks (production-safe). |
| [`DebugAPIProvider`](/api/DebugAPIProvider) | Verbose console output including full request/response bodies — development only. |
| [`JSONAPIProvider`](/api/JSONAPIProvider) | A `ClientAPIProvider` that forces JSON request bodies and always parses responses as JSON. |
| [`XMLAPIProvider`](/api/XMLAPIProvider) | A `ClientAPIProvider` that sends XML request bodies and returns raw text responses. |
| [`MockAPIProvider`](/api/MockAPIProvider) | Intercepts fetches through a [`RequestHandler`](/util/http/RequestHandler); records all calls. No network requests. |
| [`MockEndpointAPIProvider`](/api/MockEndpointAPIProvider) | Routes mock fetches through a real [`EndpointHandler`](/api/EndpointHandler) array — test client and server together. |
| [`CachedAPIProvider`](/api/CachedAPIProvider) | Serves calls through an [`APICache`](/api/APICache) and exposes `invalidate` / `refresh` helpers. |

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

[`LoggingAPIProvider`](/api/LoggingAPIProvider) sees every call first, [`ValidationAPIProvider`](/api/ValidationAPIProvider) validates next, [`ClientAPIProvider`](/api/ClientAPIProvider) sends last.

## See also

- [`api`](/api) — parent module overview
- [`api`](/api) — endpoint definitions and handler wiring
- [`api`](/api) — [`APICache`](/api/APICache) and [`EndpointCache`](/api/EndpointCache) used internally
- [`schema`](/schema) — [`Schema<T>`](/schema/Schema) used by [`ValidationAPIProvider`](/api/ValidationAPIProvider)
- [`react`](/react) — [`createAPIContext()`](/react/createAPIContext) for React integration

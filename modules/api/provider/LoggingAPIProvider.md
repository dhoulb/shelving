# LoggingAPIProvider

A wrapping provider that logs requests, responses, and errors. `LoggingAPIProvider` is production-safe — it logs concise lines rather than full bodies (use [`DebugAPIProvider`](/api/DebugAPIProvider) for verbose development output).

The constructor takes the `source` provider plus three optional callbacks — `onRequest`, `onResponse`, `onError` — each defaulting to a `console`-based logger.

## Usage

```ts
import { ClientAPIProvider, LoggingAPIProvider } from "shelving/api"

// Default console logging.
const provider = new LoggingAPIProvider(
  new ClientAPIProvider({ url: "https://api.example.com" })
)

// Or route logs into your own logger.
const custom = new LoggingAPIProvider(
  new ClientAPIProvider({ url: "https://api.example.com" }),
  (request) => logger.info("api request", request.url),
  (response, request) => logger.info("api response", request.url, response.status),
  (reason, request) => logger.error("api error", request.url, reason),
)
```

## See also

- [`DebugAPIProvider`](/api/DebugAPIProvider) — verbose console output for development.
- [`ThroughAPIProvider`](/api/ThroughAPIProvider) — the pass-through base.
- [`shelving/api`](/api) — overview of the provider hierarchy.

# LoggingAPIProvider

- Kind: class
- Import: `import { LoggingAPIProvider } from "shelving/api";`
- Extends: `ThroughAPIProvider<P, R>`

Provider that logs fetches to the console to keep useful request/response logs in production.
- Defaults to logging requests, responses, and errors via the `log` utilities; each can be overridden.

A wrapping provider that logs requests, responses, and errors. `LoggingAPIProvider` is production-safe — it logs concise lines rather than full bodies (use `DebugAPIProvider` for verbose development output).

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


## Signatures

```ts
new LoggingAPIProvider<P, R>(source: APIProvider<P, R>, onRequest: Callback<[Request]> = logRequest, onResponse: Callback<[Response, Request]> = logRequestResponse, onError: Callback<[reason: unknown, Request]> = logRequestError)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `APIProvider<P, R>` |  |
| `onRequest` | `Callback<[Request]>` | Defaults to `logRequest`. |
| `onResponse` | `Callback<[Response, Request]>` | Defaults to `logRequestResponse`. |
| `onError` | `Callback<[reason: unknown, Request]>` | Defaults to `logRequestError`. |

## Returns

| Type | Description |
| --- | --- |
| `LoggingAPIProvider<P, R>` |  |

# DebugAPIProvider

A wrapping provider for development. `DebugAPIProvider` writes verbose console output for every call — including full request and response bodies — so you can see exactly what is going over the wire.

It is the noisy counterpart to [`LoggingAPIProvider`](/api/provider/LoggingAPIProvider): use `DebugAPIProvider` while developing, and `LoggingAPIProvider` (or nothing) in production.

## Usage

```ts
import { ClientAPIProvider, DebugAPIProvider } from "shelving/api"

const provider = new DebugAPIProvider(
  new ClientAPIProvider({ url: "https://api.example.com" })
)

await provider.call(getUser, { id: "u_123" })
// Console shows the full request and response, including bodies.
```

## See also

- [LoggingAPIProvider](/api/provider/LoggingAPIProvider) — concise, production-safe logging.
- [ThroughAPIProvider](/api/provider/ThroughAPIProvider) — the pass-through base.
- [api/provider](/api/provider) — overview of the provider hierarchy.

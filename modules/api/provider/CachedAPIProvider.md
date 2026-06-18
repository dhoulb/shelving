# CachedAPIProvider

A wrapping provider that serves calls through an [`APICache`](/api/APICache). Repeated calls for the same endpoint and payload skip the network and return the cached value, and it exposes `invalidate` / `refresh` helpers for cache control.

The constructor takes the `source` provider and an optional default `maxAge` (defaults to [`AVOID_REFRESH`](/store/AVOID_REFRESH) — only refetch when a value is missing or invalidated).

## Usage

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

`invalidateAll(endpoint)` and `refreshAll(endpoint)` act on every cached payload for an endpoint at once.

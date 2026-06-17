# Cache

Reactive caching layer for API calls. [`APICache`](/api/APICache) manages one [`EndpointCache`](/api/EndpointCache) per endpoint; each `EndpointCache` manages one [`EndpointStore`](/api/EndpointStore) per unique rendered URL. This three-level structure lets you cache, invalidate, and refresh at any granularity — all endpoints, a single endpoint, or a specific payload.

## Concepts

### Three levels

```
APICache
  └── EndpointCache   (one per Endpoint)
        └── EndpointStore  (one per unique rendered URL / payload)
```

[`EndpointStore`](/api/EndpointStore) does the actual fetching and holds the reactive value. [`EndpointCache`](/api/EndpointCache) keys stores by rendered URL so `GET /users/1` and `GET /users/2` are independent. [`APICache`](/api/APICache) groups endpoint caches so you can address all payloads for a given endpoint at once.

### Cache keys

[`.get(payload)`](/api/EndpointCache/get) renders the full URL (including `?query` params for `GET`/`HEAD`) and uses that as the map key. Two payloads that produce the same URL share a store.

### `call()` vs `refresh()`

- [`.call(payload, maxAge)`](/api/EndpointCache/call) — returns a cached value if it is younger than `maxAge`. Awaits any in-flight fetch. Good for on-demand reads.
- [`.refresh(payload, maxAge?)`](/api/EndpointCache/refresh) — triggers a re-fetch unless the value is already younger than `maxAge`. Does not await.

## Usage

Direct use of [`APICache`](/api/APICache) or [`EndpointCache`](/api/EndpointCache) is rarely necessary outside of [`CachedAPIProvider`](/api/CachedAPIProvider). They power the [React integration](#see-also) via [`createAPIContext()`](/react/createAPIContext).

```ts
import { APICache } from "shelving/api"
import { ClientAPIProvider, ValidationAPIProvider } from "shelving/api"

const inner = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }))
const cache = new APICache(inner)

// Fetch (or return cached) result.
const user = await cache.call(getUser, { id: "u_1" })

// Get the EndpointCache for one endpoint.
const userCache = cache.get(getUser)

// Get the EndpointStore for a specific payload — reactive, subscribable.
const store = userCache.get({ id: "u_1" })
for await (const value of store) {
  console.log(value) // emits whenever the value changes
}

// Invalidation.
cache.invalidate(getUser, { id: "u_1" })  // mark one store stale
cache.invalidateAll(getUser)              // mark all stores for getUser stale
cache.refresh(getUser, { id: "u_1" })     // trigger re-fetch for one store
cache.refreshAll(getUser)                 // trigger re-fetch for all stores
```

Cache instances implement `AsyncDisposable` — `await using cache = new APICache(...)` disposes all stores cleanly.

## See also

- [`api/store`](/api) — [`EndpointStore`](/api/EndpointStore), the reactive leaf node
- [`api/provider`](/api) — [`CachedAPIProvider`](/api/CachedAPIProvider) wraps a provider with an [`APICache`](/api/APICache)
- [`store`](/store) — [`FetchStore`](/store/FetchStore) base class
- [`react`](/react) — [`createAPIContext()`](/react/createAPIContext) uses `APICache` under the hood

# CachedAPIProvider

- Kind: class
- Import: `import { CachedAPIProvider } from "shelving/api";`
- Extends: `ThroughAPIProvider<P, R>`
- Implements: `AsyncDisposable`

API provider wrapper that serves requests through an `APICache` so repeated calls reuse cached results.
- On `call(...)`, triggers `cache.refresh(maxAge)` for the endpoint+payload before awaiting `cache.call(...)`.
- `invalidate`, `invalidateAll`, `refresh`, and `refreshAll` pass through to the underlying cache and use `this.maxAge` as the default refresh timing.

A wrapping provider that serves calls through an `APICache`. Repeated calls for the same endpoint and payload skip the network and return the cached value, and it exposes `invalidate` / `refresh` helpers for cache control.

The constructor takes the `source` provider and an optional default `maxAge` (defaults to `AVOID_REFRESH` — only refetch when a value is missing or invalidated).

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


## Signatures

```ts
new CachedAPIProvider<P, R>(source: APIProvider<P, R>, maxAge: number = AVOID_REFRESH)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `APIProvider<P, R>` |  |
| `maxAge` | `number` | Defaults to `AVOID_REFRESH`. |

## Returns

| Type | Description |
| --- | --- |
| `CachedAPIProvider<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `maxAge` | `number \| undefined` | The maximum age used when calling `call()`, defaulting to `AVOID_REFRESH` (only refresh if invalidated or still loading). - Not used for `refresh()` calls, which always refetch immediately. Read only. |

## Methods

- [CachedAPIProvider.invalidate()](CachedAPIProvider/invalidate.md): Invalidate the cached result for a specific endpoint and payload.
- [CachedAPIProvider.invalidateAll()](CachedAPIProvider/invalidateAll.md): Invalidate every cached result for an endpoint, across all payloads.
- [CachedAPIProvider.refresh()](CachedAPIProvider/refresh.md): Refresh the cached result for a specific endpoint and payload.
- [CachedAPIProvider.refreshAll()](CachedAPIProvider/refreshAll.md): Refresh every cached result for an endpoint, across all payloads.

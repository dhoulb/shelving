# APICache

- Kind: class
- Import: `import { APICache } from "shelving/api";`
- Implements: `AsyncDisposable`

Cache of `EndpointCache` objects keyed by `Endpoint`, providing memoised API results across many endpoints.
- Use `get(endpoint)` to retrieve or create the `EndpointCache` for a given endpoint, then `get(payload)` on that to get a specific `EndpointStore`.
- Disposing the cache disposes every nested `EndpointCache` and clears the map.

## Signatures

```ts
new APICache<P, R>(provider: APIProvider<P, R>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `provider` | `APIProvider<P, R>` |  |

## Returns

| Type | Description |
| --- | --- |
| `APICache<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `provider` | `APIProvider<P, R>` | The underlying `APIProvider` that backs every cached endpoint. Read only. |

## Examples

```ts
const cache = new APICache(provider);
const user = await cache.call(getUser, { id: "abc" });
```

## Methods

- [APICache.get()](APICache/get.md): Get (or create) the EndpointCache for the given endpoint.
- [APICache.call()](APICache/call.md): Fetch (or return a cached result) for the given endpoint and payload.
- [APICache.invalidate()](APICache/invalidate.md): Invalidate a specific store for an endpoint so the next read refetches.
- [APICache.invalidateAll()](APICache/invalidateAll.md): Invalidate all stores for an endpoint so the next read of any payload refetches.
- [APICache.refresh()](APICache/refresh.md): Trigger a refetch on a specific store for an endpoint.
- [APICache.refreshAll()](APICache/refreshAll.md): Trigger a refetch on all stores for an endpoint.

# EndpointCache

- Kind: class
- Import: `import { EndpointCache } from "shelving/api";`
- Implements: `AsyncDisposable`

Cache of `EndpointStore` objects for a single endpoint, keyed by the rendered request URL of each payload.
- Use `get(payload)` to retrieve or create the `EndpointStore` for a given payload.
- Disposing the cache disposes every nested `EndpointStore` and clears the map.

## Signatures

```ts
new EndpointCache<P, R>(endpoint: Endpoint<P, R>, provider: APIProvider<P, R>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `endpoint` | `Endpoint<P, R>` |  |
| `provider` | `APIProvider<P, R>` |  |

## Returns

| Type | Description |
| --- | --- |
| `EndpointCache<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `endpoint` | `Endpoint<P, R>` | The endpoint that every store in this cache fetches from. Read only. |
| `provider` | `APIProvider<P, R>` | The `APIProvider` used to render URLs and fetch results for this endpoint. Read only. |

## Examples

```ts
const cache = new EndpointCache(getUser, provider);
const user = await cache.call({ id: "abc" });
```

## Methods

- [EndpointCache.get()](EndpointCache/get.md): Get (or create) the EndpointStore for the given payload.
- [EndpointCache.call()](EndpointCache/call.md): Fetch (or return a cached result) for the given payload.
- [EndpointCache.invalidate()](EndpointCache/invalidate.md): Invalidate a specific store so the next read refetches.
- [EndpointCache.invalidateAll()](EndpointCache/invalidateAll.md): Invalidate all stores so the next read of any payload refetches.
- [EndpointCache.refresh()](EndpointCache/refresh.md): Trigger a refetch on a specific store.
- [EndpointCache.refreshAll()](EndpointCache/refreshAll.md): Trigger a refetch on all stores.

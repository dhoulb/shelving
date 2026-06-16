# Endpoint store

Reactive per-request state for a single API call. [`EndpointStore`](/api/EndpointStore) holds the current result for one endpoint+payload pair and fetches automatically on first read.

## Concepts

### EndpointStore

`EndpointStore<P, R>` extends [`PayloadFetchStore`](/store/PayloadFetchStore) from the [`store`](/store) module. It binds an [`Endpoint`](/api/Endpoint), a payload value, and an [`APIProvider`](/api/APIProvider) together. When [`.value`](/store/Store/value) or [`.loading`](/store/Store/loading) is first read, it triggers a fetch automatically. Concurrent reads de-duplicate the in-flight request — only one network call goes out regardless of how many subscribers read the value.

The store's reactive contract follows the rest of the shelving store layer:

- [`.value`](/store/Store/value) — throws a `Promise` while loading (suspense-compatible), throws [`.reason`](/store/Store/reason) on failure, returns `R` when ready.
- [`.loading`](/store/Store/loading) — `true` while a fetch is in progress; reading it also triggers the initial fetch.
- [`.invalidate()`](/store/FetchStore/invalidate) — marks the value stale; the next read starts a fresh fetch.
- [`.refresh(maxAge?)`](/store/FetchStore/refresh) — triggers a re-fetch unless the cached value is younger than `maxAge` milliseconds.
- Implements `AsyncIterable<R>` — `for await...of` emits each new value as it arrives.

Payload changes are tracked via the inner [`.payload`](/store/PayloadFetchStore/payload) store. Updating `store.payload.value` cancels any in-flight fetch and starts a new one.

### Where EndpointStore lives in the stack

`EndpointStore` is the leaf node in a three-level cache hierarchy:

```
APICache
  └── EndpointCache   (one per Endpoint)
        └── EndpointStore  (one per unique rendered URL / payload)
```

In normal use you don't create `EndpointStore` directly. [`EndpointCache`](/api/EndpointCache) creates and keys them by rendered URL. The [`react`](/react) module's [`createAPIContext()`](/react/createAPIContext) exposes them through hooks.

## Usage

Direct instantiation is useful when you need a single reactive handle outside the cache layer:

```ts
import { EndpointStore } from "shelving/api"
import { ClientAPIProvider, ValidationAPIProvider, GET } from "shelving/api"
import { DATA, STRING } from "shelving/schema"

const getUser = GET("/users/{id}", DATA({ id: STRING }), DATA({ name: STRING }))
const provider = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com" }))

const store = new EndpointStore(getUser, { id: "u_1" }, provider)

// Subscribe to value changes.
for await (const user of store) {
  console.log(user.name)
}

// Change the payload — cancels the previous fetch, starts a new one.
store.payload.value = { id: "u_2" }

// Explicit invalidation.
store.invalidate()
await store.refresh()
```

## See also

- [`api`](/api) — [`EndpointCache`](/api/EndpointCache) and [`APICache`](/api/APICache) manage stores keyed by payload
- [`api`](/api) — providers that [`EndpointStore`](/api/EndpointStore) delegates fetching to
- [`store`](/store) — [`FetchStore`](/store/FetchStore) and [`PayloadFetchStore`](/store/PayloadFetchStore) base classes
- [`react`](/react) — [`createAPIContext()`](/react/createAPIContext) exposes stores as React hooks

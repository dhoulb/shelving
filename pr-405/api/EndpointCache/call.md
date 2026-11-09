# EndpointCache.call()

- Kind: method
- Member of: `EndpointCache`

Fetch (or return a cached result) for the given payload.
- Returns the cached value immediately if one exists.
- Waits for the in-flight fetch if the store is loading.
- Throws if the fetch fails, matching `APIProvider.call` behaviour.

## Signatures

```ts
call(payload: P, maxAge: number = AVOID_REFRESH, caller: AnyCaller = this.call): Promise<R>
```

# APICache.call()

- Kind: method
- Member of: `APICache`

Fetch (or return a cached result) for the given endpoint and payload.
- Returns the cached value immediately if one exists.
- Waits for the in-flight fetch if the store is loading.
- Throws if the fetch fails, matching `APIProvider.call` behaviour.

## Signatures

```ts
call(endpoint: Endpoint<PP, RR>, payload: PP, maxAge: number = AVOID_REFRESH, caller: AnyCaller = this.call): Promise<RR>
```

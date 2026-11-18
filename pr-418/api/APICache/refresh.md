# APICache.refresh()

- Kind: method
- Member of: `APICache`

Trigger a refetch on a specific store for an endpoint.

## Signatures

```ts
refresh(endpoint: Endpoint<PP, RR>, payload: PP, maxAge?: number): Promise<void>
```

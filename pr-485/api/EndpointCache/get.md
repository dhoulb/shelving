# EndpointCache.get()

- Kind: method
- Member of: `EndpointCache`

Get (or create) the `EndpointStore` for the given payload.
- Stores are keyed by `serialise(payload)`, so equal payloads share a store, whatever their key order.

## Signatures

```ts
get(payload: P): EndpointStore<P, R>
```

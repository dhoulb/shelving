# EndpointCache.get()

- Kind: method
- Member of: `EndpointCache`

Get (or create) the `EndpointStore` for the given payload.
- Stores are keyed by the rendered request URL, so equivalent payloads share a store.

## Signatures

```ts
get(payload: P, caller: AnyCaller = this.get): EndpointStore<P, R>
```

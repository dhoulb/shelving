# APIContext.useAPI()

- Kind: method
- Member of: `APIContext`

React hook to return an `EndpointStore` for the specified endpoint/payload in the current `APIProvider` context.

## Signatures

```ts
useAPI(this: void, endpoint: Endpoint<PP, RR>, payload: PP): EndpointStore<PP, RR>
useAPI(this: void, endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined
```

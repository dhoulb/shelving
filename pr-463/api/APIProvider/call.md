# APIProvider.call()

- Kind: method
- Member of: `APIProvider`

Send a payload to an `Endpoint` and retrieve the parsed result.
- Composes `createRequest()`, `fetch()`, and `parseResponse()` into a single round trip.

## Signatures

```ts
call(endpoint: Endpoint<PP, RR>, payload: PP, options?: RequestOptions, caller?: AnyCaller): Promise<RR>
```

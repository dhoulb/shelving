# APIProvider.parseResponse()

- Kind: method
- Member of: `APIProvider`

Parse an HTTP `Response` for this endpoint into a result value.
- Non-2xx responses become `ResponseError`.
- Does not validate the result against the endpoint schema — use `ValidationAPIProvider` for that.

## Signatures

```ts
parseResponse(_endpoint: Endpoint<PP, RR>, response: Response, caller?: AnyCaller): Promise<RR>
```

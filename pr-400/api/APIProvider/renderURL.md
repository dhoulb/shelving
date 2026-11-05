# APIProvider.renderURL()

- Kind: method
- Member of: `APIProvider`

Render the full final URL for an API request to a given endpoint with a given payload.
- Includes `?query` params if this is a `HEAD` or `GET` request.

## Signatures

```ts
renderURL(endpoint: Endpoint<PP, RR>, payload: PP, caller?: AnyCaller): URL
```

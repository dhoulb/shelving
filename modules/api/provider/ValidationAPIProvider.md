# ValidationAPIProvider

A wrapping provider that validates data against the endpoint's [schemas](/schema). `ValidationAPIProvider` validates the payload before the request is built and validates the result after the response is parsed — so a malformed payload is caught before it leaves, and a bad response surfaces as a clear error.

Place it just inside the network provider so everything above it works with validated, typed data.

## Usage

```ts
import { ClientAPIProvider, ValidationAPIProvider } from "shelving/api"

const provider = new ValidationAPIProvider(
  new ClientAPIProvider({ url: "https://api.example.com" })
)

// Payload validated against the endpoint's payload schema before sending;
// result validated against its result schema before returning.
const user = await provider.call(getUser, { id: "u_123" })
```

## See also

- [ThroughAPIProvider](/api/provider/ThroughAPIProvider) — the pass-through base.
- [schema](/schema) — the `Schema<T>` validators used here.
- [api/provider](/api/provider) — overview of the provider hierarchy.

# ValidationAPIProvider

- Kind: class
- Import: `import { ValidationAPIProvider } from "shelving/api";`
- Extends: `ThroughAPIProvider<P, R>`

Provider that validates payloads and results against the endpoint's schemas, so a source of any type is made type-safe.
- Payload validation errors bubble up as user-readable strings; result validation errors are wrapped in `ResponseError`.

A wrapping provider that validates data against the endpoint's `shelving/schema`. `ValidationAPIProvider` validates the payload before the request is built and validates the result after the response is parsed — so a malformed payload is caught before it leaves, and a bad response surfaces as a clear error.

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


## Signatures

```ts
new ValidationAPIProvider<P, R>()
```

## Returns

| Type | Description |
| --- | --- |
| `ValidationAPIProvider<P, R>` |  |

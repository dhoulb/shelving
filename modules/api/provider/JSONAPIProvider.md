# JSONAPIProvider

A [`ClientAPIProvider`](/api/ClientAPIProvider) that forces JSON. It sends request bodies as JSON and always parses responses as JSON, regardless of content-type headers — useful against APIs that are inconsistent about declaring `application/json`.

Because it extends `ClientAPIProvider`, it is a concrete network provider: construct it with the same `{ url, options?, timeout? }` options.

## Usage

```ts
import { JSONAPIProvider, ValidationAPIProvider } from "shelving/api"

const provider = new ValidationAPIProvider(
  new JSONAPIProvider({ url: "https://api.example.com" })
)

const user = await provider.call(getUser, { id: "u_123" })
```

## See also

- [`ClientAPIProvider`](/api/ClientAPIProvider) — the base network provider.
- [`XMLAPIProvider`](/api/XMLAPIProvider) — the XML equivalent.
- [api/provider](/api/provider) — overview of the provider hierarchy.

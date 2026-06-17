# ClientAPIProvider

The concrete network provider. `ClientAPIProvider` sends requests over the network with the global `fetch()` API and is the innermost provider in almost every chain.

The constructor takes `{ url, options?, timeout? }` — a base URL that endpoint paths are resolved against, optional default `RequestInit` options, and a request timeout in milliseconds (default `20000`).

## Usage

```ts
import { ClientAPIProvider } from "shelving/api"

const provider = new ClientAPIProvider({
  url: "https://api.example.com",
  timeout: 10_000,
})

const user = await provider.call(getUser, { id: "u_123" })
```

In practice you wrap it — e.g. `new ValidationAPIProvider(new ClientAPIProvider({ url }))` — so payloads and results are validated. See [building a provider chain](/api/provider).

## See also

- [`APIProvider`](/api/APIProvider) — the abstract base.
- [`JSONAPIProvider`](/api/JSONAPIProvider) / [`XMLAPIProvider`](/api/XMLAPIProvider) — client variants for specific content types.
- [api/provider](/api/provider) — overview of the provider hierarchy.

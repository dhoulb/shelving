# ClientAPIProvider

- Kind: class
- Import: `import { ClientAPIProvider } from "shelving/api";`
- Extends: `APIProvider<P, R>`

A client-side API provider that sends requests over the network using `fetch()`.
- Can be used on a server environment to make outgoing API calls, or in a browser environment to call a server API.
- Renders endpoint paths and query params into the URL and sends body payloads as JSON.
- Parses JSON responses and throws `ResponseError` for non-2xx responses.
- Extendable with custom request-building and response-parsing logic by overriding `createRequest()` and `parseResponse()`.
- Wrap in `ValidationAPIProvider` to add automatic validation of request payloads and response results against endpoint schemas.

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

In practice you wrap it — e.g. `new ValidationAPIProvider(new ClientAPIProvider({ url }))` — so payloads and results are validated. See `shelving/api` for building a provider chain.


## Signatures

```ts
new ClientAPIProvider<P, R>({ url, options = {}, timeout = 20_000 }: ClientAPIProviderOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ClientAPIProviderOptions` |  |
| `.url` | `PossibleURL` | The common base URL for all rendered endpoint requests. Note: When resolving URLs for endpoints this is treated as if it ends in a slash. - e.g. in `http://p.com/a/b/c` the path will be relative to `c` as if a `/` trailing slash was present. - This is different to the default behaviour of `new URL()`, but is the more natural expected result - This is consistent with our e.g. `getURL()` utilities. Read only. |
| `.options` | `Omit<RequestOptions, "signal">` | Options used for HTTP requests created with `this.createRequest()` and `this.fetch()` - Omits `signal` because it's not relevant at the provider level. Read only. Optional. |
| `.timeout` | `number \| undefined` | Timeout in milliseconds before the request is aborted with `TimeoutError`. - Defaults to `20_000` (20 seconds) — chosen to fire before common platform wall-clock caps (Cloudflare Workers ~30s, Vercel/AWS API Gateway ~29s) so the abort propagates as a clean rejection instead of an opaque runtime termination. - Pass `0` to disable the timeout (e.g. for streaming or long-poll endpoints). Raise it for specifically slow endpoints. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ClientAPIProvider<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `options` | `RequestOptions` | Default options used for HTTP requests created with `this.createRequest()` and `this.fetch()` Read only. |
| `timeout` | `number` | Timeout in milliseconds before the request is aborted, or `0` for no timeout. Read only. |

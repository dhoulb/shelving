# APIProvider

- Kind: class
- Import: `import { APIProvider } from "shelving/api";`
- Implements: `AsyncDisposable`

Abstract base for API providers that send requests to a set of `Endpoint` definitions rooted at a common base URL.
- Concrete subclasses implement `renderURL()`, `createRequest()`, `fetch()`, and `parseResponse()`; `call()` orchestrates them.
- Implements `AsyncDisposable` so providers can be wrapped and disposed in a chain.

The abstract base class every API provider implements. `APIProvider<P, R>` defines the surface that endpoint calls go through: `call(endpoint, payload)` to execute a typed endpoint, and `fetch(request)` as the lower-level transport step that wrapper providers intercept.

You never instantiate `APIProvider` directly — use the concrete `ClientAPIProvider` (or a mock), optionally wrapped in `ThroughAPIProvider` subclasses. `APIProvider` implements `AsyncDisposable`.

## Usage

Code that accepts "any provider" should type against `APIProvider` so a bare client, a validated chain, or a mock are all interchangeable:

```ts
import type { APIProvider } from "shelving/api"

async function loadUser(provider: APIProvider, id: string) {
  return provider.call(getUser, { id }); // works with any provider in the chain
}
```


## Signatures

```ts
new APIProvider<P, R>()
```

## Returns

| Type | Description |
| --- | --- |
| `APIProvider<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `url` | `URL` | The common base URL that every endpoint request is resolved against. Read only. |

## Methods

- [APIProvider.renderURL()](APIProvider/renderURL.md): Render the full final URL for an API request to a given endpoint with a given payload.
- [APIProvider.createRequest()](APIProvider/createRequest.md): Create a Request that targets this endpoint with a given base URL.
- [APIProvider.fetch()](APIProvider/fetch.md): Send a Request and return its Response (defaults to the JavaScript fetch() API).
- [APIProvider.parseResponse()](APIProvider/parseResponse.md): Parse an HTTP Response for this endpoint into a result value.
- [APIProvider.call()](APIProvider/call.md): Send a payload to an Endpoint and retrieve the parsed result.

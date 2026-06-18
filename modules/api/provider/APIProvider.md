# APIProvider

The abstract base class every API provider implements. `APIProvider<P, R>` defines the surface that endpoint calls go through: `call(endpoint, payload)` to execute a typed endpoint, and `fetch(request)` as the lower-level transport step that wrapper providers intercept.

You never instantiate `APIProvider` directly — use the concrete [`ClientAPIProvider`](/api/ClientAPIProvider) (or a mock), optionally wrapped in [`ThroughAPIProvider`](/api/ThroughAPIProvider) subclasses. `APIProvider` implements `AsyncDisposable`.

## Usage

Code that accepts "any provider" should type against `APIProvider` so a bare client, a validated chain, or a mock are all interchangeable:

```ts
import type { APIProvider } from "shelving/api"

async function loadUser(provider: APIProvider, id: string) {
  return provider.call(getUser, { id }); // works with any provider in the chain
}
```

# ThroughAPIProvider

The pass-through base class for wrapping providers. `ThroughAPIProvider` takes a `source` provider and delegates every method to it. Extend it to intercept only the methods you care about — adding auth headers, retries, metrics — without reimplementing transport logic.

[`ValidationAPIProvider`](/api/ValidationAPIProvider), [`LoggingAPIProvider`](/api/LoggingAPIProvider), [`DebugAPIProvider`](/api/DebugAPIProvider), [`MockAPIProvider`](/api/MockAPIProvider), and [`CachedAPIProvider`](/api/CachedAPIProvider) are all `ThroughAPIProvider` subclasses.

## Usage

Override `fetch()` (or `call()`) and call `super` to delegate the rest. For example, a provider that injects an `Authorization` header:

```ts
import { ThroughAPIProvider } from "shelving/api"
import type { APIProvider } from "shelving/api"

class AuthAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
  constructor(source: APIProvider<P, R>, readonly token: string) { super(source) }

  override fetch(request: Request): Promise<Response> {
    const authed = new Request(request, {
      headers: { ...Object.fromEntries(request.headers), Authorization: `Bearer ${this.token}` },
    })
    return super.fetch(authed)
  }
}
```

## See also

- [`APIProvider`](/api/APIProvider) — the abstract base.
- [api/provider](/api/provider) — overview of the provider hierarchy.

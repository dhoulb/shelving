# ThroughAPIProvider

- Kind: class
- Import: `import { ThroughAPIProvider } from "shelving/api";`
- Extends: `APIProvider<P, R>`
- Implements: `Sourceable<APIProvider<P, R>>`

Provider wrapper that delegates every API operation to a wrapped `source` provider.
- Extend this when you want to intercept only selected API operations, such as injecting auth headers or logging.
- Implements `Sourceable` so wrapped providers are discoverable via `getSource()` / `requireSource()`.

The pass-through base class for wrapping providers. `ThroughAPIProvider` takes a `source` provider and delegates every method to it. Extend it to intercept only the methods you care about — adding auth headers, retries, metrics — without reimplementing transport logic.

`ValidationAPIProvider`, `LoggingAPIProvider`, `DebugAPIProvider`, `MockAPIProvider`, and `CachedAPIProvider` are all `ThroughAPIProvider` subclasses.

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


## Signatures

```ts
new ThroughAPIProvider<P, R>(source: APIProvider<P, R>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `APIProvider<P, R>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ThroughAPIProvider<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `APIProvider<P, R>` | The wrapped source provider that operations delegate to. Read only. |

# MockAPIProvider

- Kind: class
- Import: `import { MockAPIProvider } from "shelving/api";`
- Extends: `ThroughAPIProvider<P, R>`

Provider that records API calls and serves them from a handler without sending network requests.
- Extends `ThroughAPIProvider` to delegate request building and response parsing to a source `APIProvider`.
- The source provider's `fetch()` is never called — this provider intercepts all fetches and routes them through a `RequestHandler`.
- Records `requestCalls`, `fetchCalls`, and `responseCalls` so tests can assert on what happened.

A wrapping provider for tests. `MockAPIProvider` intercepts fetches through a `RequestHandler` instead of hitting the network, and records every call it makes so a test can assert on them.

The constructor takes an optional `RequestHandler` and an optional `source` provider — both have defaults, so `new MockAPIProvider()` is enough for a provider that records calls and returns canned responses.

## Usage

```ts
import { MockAPIProvider } from "shelving/api"

const api = new MockAPIProvider((request) => new Response(JSON.stringify({ id: "u_1", name: "Alice" })))

const user = await api.call(getUser, { id: "u_1" })

console.log(api.requestCalls) // inspect every recorded request
```

For tests that exercise client and server logic together, use `MockEndpointAPIProvider`, which routes the mock transport through a real handler array.


## Signatures

```ts
new MockAPIProvider<P, R>(handler: RequestHandler = _mockHandler, source: APIProvider<P, R> = new ClientAPIProvider({ url: "https://api.mock.com" }))
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `handler` | `RequestHandler` | Defaults to `_mockHandler`. |
| `source` | `APIProvider<P, R>` | Defaults to `new ClientAPIProvider({ url: "https://api.mock.com" })`. |

## Returns

| Type | Description |
| --- | --- |
| `MockAPIProvider<P, R>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `requestCalls` | `MockAPIRequestCall[]` | Records of every request built by this provider. Read only. Defaults to `[]`. |
| `fetchCalls` | `MockAPIFetchCall[]` | Records of every fetch handled by this provider. Read only. Defaults to `[]`. |
| `responseCalls` | `MockAPIResponseCall[]` | Records of every response parsed by this provider. Read only. Defaults to `[]`. |
| `handler` | `RequestHandler` | The request handler that serves fetches in place of the network. Read only. |

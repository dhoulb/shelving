# MockEndpointAPIProvider

- Kind: class
- Import: `import { MockEndpointAPIProvider } from "shelving/api";`
- Extends: `MockAPIProvider<P, R>`

Provider that mocks an API that calls and matches an array of `EndpointHandler` objects returned from `Endpoint.handler()`
- Used to test server-side API code, calls against an API made up of multiple `Endpoint` instances.

A `MockAPIProvider` that wires the mock transport directly to a real `EndpointHandler` array. Client code calls endpoints exactly as in production, but each call is dispatched to its handler in the same process — so you can test client and server logic together without a network.

The constructor takes the `handlers` array, a `context` value passed to every handler, and an optional `source` provider.

## Usage

```ts
import { MockEndpointAPIProvider } from "shelving/api"

const handlers = [
  getUser.handler(async ({ id }) => ({ id, name: "Alice", email: "alice@example.com" })),
]

const api = new MockEndpointAPIProvider(handlers, undefined)

const user = await api.call(getUser, { id: "u_1" })
// user == { id: "u_1", name: "Alice", email: "alice@example.com" }

console.log(api.requestCalls) // inspect recorded calls
```


## Signatures

```ts
new MockEndpointAPIProvider<P, R, C>(handlers: EndpointHandlers<C>, context: C, source?: ClientAPIProvider<P, R>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `handlers` | `EndpointHandlers<C>` |  |
| `context` | `C` |  |
| `source` | `ClientAPIProvider<P, R>` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `MockEndpointAPIProvider<P, R, C>` |  |

# MockEndpointAPIProvider

A [`MockAPIProvider`](/api/MockAPIProvider) that wires the mock transport directly to a real [`EndpointHandler`](/api/EndpointHandler) array. Client code calls endpoints exactly as in production, but each call is dispatched to its handler in the same process — so you can test client and server logic together without a network.

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

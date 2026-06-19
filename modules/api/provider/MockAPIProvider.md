# MockAPIProvider

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

# EndpointCallback

- Kind: type
- Import: `import { EndpointCallback } from "shelving/api";`

A function that handles an endpoint request, receiving a validated payload and returning a result.

## Signatures

```ts
(payload: P, request: Request, context: C) => R | Response | Promise<R | Response>
```

## Returns

| Type | Description |
| --- | --- |
| `Response` | Returning a `Response` object (this will pass back to the client without validation). |
| `R` | Returning the return type of the handler (this will be validated against the Endpoint's result schema). |

## Types

- `Request`
- `Response`
- `Promise`

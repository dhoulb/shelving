# EndpointHandlers

- Kind: type
- Import: `import { EndpointHandlers } from "shelving/api";`

A collection of endpoint handlers that can be matched and invoked by `handleEndpoints()`.

## Signatures

```ts
Iterable<AnyEndpointHandler<C>>
```

## Types

- `Iterable`
- [AnyEndpointHandler](AnyEndpointHandler.md): An EndpointHandler with any payload and result type, for use where the specific types don't matter.

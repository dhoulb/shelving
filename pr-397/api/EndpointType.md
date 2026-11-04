# EndpointType

- Kind: type
- Import: `import { EndpointType } from "shelving/api";`

Extract the result type from an `Endpoint`.

## Signatures

```ts
X extends Endpoint<unknown, infer Y> ? Y : never
```

## Types

- [Endpoint](Endpoint.md): A typed API resource definition pairing a method and path with payload and result schemas.
- `Y`

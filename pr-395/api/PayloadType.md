# PayloadType

- Kind: type
- Import: `import { PayloadType } from "shelving/api";`

Extract the payload type from an `Endpoint`.

## Signatures

```ts
X extends Endpoint<infer Y, unknown> ? Y : never
```

## Types

- [Endpoint](Endpoint.md): A typed API resource definition pairing a method and path with payload and result schemas.
- `Y`

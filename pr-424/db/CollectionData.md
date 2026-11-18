# CollectionData

- Kind: type
- Import: `import { CollectionData } from "shelving/db";`

Extract the `Data` type from a `Collection` instance.

## Signatures

```ts
C extends Collection<infer _N, infer _I, infer T> ? T : never
```

## Types

- [Collection](Collection.md): Declarative definition of a database collection/table.
- `T`

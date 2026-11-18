# CollectionIdentifier

- Kind: type
- Import: `import { CollectionIdentifier } from "shelving/db";`

Extract the `Identifier` type from a `Collection` instance.

## Signatures

```ts
C extends Collection<infer _N, infer I, infer _T> ? I : never
```

## Types

- [Collection](Collection.md): Declarative definition of a database collection/table.
- `I`

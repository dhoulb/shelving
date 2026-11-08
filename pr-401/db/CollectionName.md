# CollectionName

- Kind: type
- Import: `import { CollectionName } from "shelving/db";`

Extract the string name from a `Collection` instance.

## Signatures

```ts
C extends Collection<infer N, infer _I, infer _T> ? N : never
```

## Types

- [Collection](Collection.md): Declarative definition of a database collection/table.
- `N`

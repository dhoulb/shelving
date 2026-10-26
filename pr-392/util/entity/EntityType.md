# EntityType

- Kind: type
- Import: `import { EntityType } from "shelving/util/entity";`

Extract the type portion from an `Entity` string.

## Signatures

```ts
E extends Entity<infer T> ? T : never
```

## Types

- [Entity](Entity.md): Entity string combining a type and ID, e.g. challenge:a1b2c3
- `T`

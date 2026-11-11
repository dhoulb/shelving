# Schemas

- Kind: type
- Import: `import { Schemas } from "shelving/schema";`

A set of named schemas in `{ name: schema }` format.

## Signatures

```ts
{ readonly [K in keyof T]: Schema<T[K]> }
```

## Types

- [Schema](Schema.md): Schema is an object instance with a validate() method that converts unknown input into a known, valid type T.
- `K`

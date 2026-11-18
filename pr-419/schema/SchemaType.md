# SchemaType

- Kind: type
- Import: `import { SchemaType } from "shelving/schema";`

Extract the validated value type `T` from a `Schema<T>`.

## Signatures

```ts
X extends Schema<infer Y> ? Y : never
```

## Types

- [Schema](Schema.md): Schema is an object instance with a validate() method that converts unknown input into a known, valid type T.
- `Y`

## Examples

```ts
type V = SchemaType<typeof STRING> // string
```

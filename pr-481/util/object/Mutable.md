# Mutable

- Kind: type
- Import: `import { Mutable } from "shelving/util/object";`

Mutable type is the opposite of `Readonly<T>` helper type.
- See https://github.com/microsoft/TypeScript/issues/24509
- Consistency with `Readonly<T>`

## Signatures

```ts
{ -readonly [K in keyof T]: T[K] }
```

## Types

- `K`

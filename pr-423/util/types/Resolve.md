# Resolve

- Kind: type
- Import: `import { Resolve } from "shelving/util/types";`

Helper type to resolve and normalise an object.

- i.e. `{ a: string } & { b: number }` becomes `{ a: string, b: number }`

## Signatures

```ts
{ [K in keyof T]: T[K] }
```

## Types

- `K`

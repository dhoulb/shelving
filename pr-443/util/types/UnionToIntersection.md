# UnionToIntersection

- Kind: type
- Import: `import { UnionToIntersection } from "shelving/util/types";`

Helper type to turn a union type into an intersection type.

- i.e. `A | B` becomes `A & B`

## Signatures

```ts
(U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never
```

## Types

- `I`

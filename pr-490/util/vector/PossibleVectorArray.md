# PossibleVectorArray

- Kind: type
- Import: `import { PossibleVectorArray } from "shelving/util/vector";`

A value that `getVectorArray()` can turn into a `VectorArray`.

## Signatures

```ts
VectorArray | ImmutableArray<number> | { readonly [index: string]: number }
```

## Types

- [VectorArray](VectorArray.md): A vector of numbers, for example a text embedding, stored as a Float32Array.
- [ImmutableArray](../array/ImmutableArray.md): Immutable array: an array that cannot be changed.

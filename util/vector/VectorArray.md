# VectorArray

- Kind: type
- Import: `import { VectorArray } from "shelving/util/vector";`

A vector of numbers, for example a text embedding, stored as a `Float32Array`.
- Float32 keeps about 7 significant digits, which is more than search needs, in 4 bytes per number.
- `JSON.stringify()` turns a `Float32Array` into an object like `{"0":0.1,"1":-0.2}`. That loses nothing, and `getVectorArray()` reads it back.

## Signatures

```ts
Float32Array
```

## Types

- `Float32Array`

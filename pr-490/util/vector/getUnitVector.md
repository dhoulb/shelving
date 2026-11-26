# getUnitVector()

- Kind: function
- Import: `import { getUnitVector } from "shelving/util/vector";`

Get a vector scaled to length 1, so the dot product of two unit vectors is their cosine similarity.
- A vector of all zeros has no direction, so it is returned as it is.

## Signatures

```ts
getUnitVector(vector: VectorArray): VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `vector` | `VectorArray` | The vector to scale. |

## Returns

| Type | Description |
| --- | --- |
| `VectorArray` | A new vector of length 1, or the input when it is all zeros. |

## Examples

```ts
getUnitVector(new Float32Array([3, 4])) // Float32Array [0.6, 0.8]
```

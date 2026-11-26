# getDotProduct()

- Kind: function
- Import: `import { getDotProduct } from "shelving/util/vector";`

Get the dot product of two vectors: the sum of their numbers multiplied in pairs.
- For two unit vectors (see `getUnitVector()`) this is their cosine similarity: 1 is the same direction, 0 is unrelated.
- Missing numbers in the shorter vector count as zero.

## Signatures

```ts
getDotProduct(left: VectorArray, right: VectorArray): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `VectorArray` | The first vector. |
| `right` | `VectorArray` | The second vector. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The dot product. |

## Examples

```ts
getDotProduct(new Float32Array([1, 2]), new Float32Array([3, 4])) // 11
```

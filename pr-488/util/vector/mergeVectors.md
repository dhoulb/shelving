# mergeVectors()

- Kind: function
- Import: `import { mergeVectors } from "shelving/util/vector";`

Join several vectors and single numbers into one longer vector, in order.
- The dot product of two joined vectors is the sum of the dot products of their parts. So one comparison can score several things at once (for example meaning, words, and popularity), and the weights of the parts set the balance.

## Signatures

```ts
mergeVectors(...parts: ImmutableArray<VectorArray | number>): VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `parts` | `ImmutableArray<VectorArray \| number>` | The vectors and numbers to join. |

## Returns

| Type | Description |
| --- | --- |
| `VectorArray` | A new vector with every part's numbers in order. |

## Examples

```ts
mergeVectors(new Float32Array([1, 2]), 3) // Float32Array [1, 2, 3]
```

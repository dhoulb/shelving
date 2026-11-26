# getScaledVector()

- Kind: function
- Import: `import { getScaledVector } from "shelving/util/vector";`

Get a vector with every number multiplied by a weight.

## Signatures

```ts
getScaledVector(vector: VectorArray, weight: number): VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `vector` | `VectorArray` | The vector to scale. |
| `weight` | `number` | The number to multiply by. |

## Returns

| Type | Description |
| --- | --- |
| `VectorArray` | A new vector, or the input when the weight is 1. |

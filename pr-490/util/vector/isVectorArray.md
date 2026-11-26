# isVectorArray()

- Kind: function
- Import: `import { isVectorArray } from "shelving/util/vector";`

Is an unknown value a `VectorArray` (optionally with an exact size)?

## Signatures

```ts
isVectorArray(value: unknown, size?: number): value is VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `size` | `number` | The exact number of items the vector must have, or `undefined` for any size. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `value is VectorArray` | `true` if the value is a `Float32Array` of that size. |

## Examples

```ts
isVectorArray(new Float32Array(3), 3) // true
```

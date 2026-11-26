# getVectorArray()

- Kind: function
- Import: `import { getVectorArray } from "shelving/util/vector";`

Get a `VectorArray` from a possible vector, or `undefined` if the value is not one.
- A `Float32Array` is returned as it is.
- An array of finite numbers becomes a new `Float32Array`.
- An object whose keys are `"0"` to `"n-1"` with finite number values (what `JSON.stringify()` makes of a `Float32Array`) becomes a new `Float32Array`.

## Signatures

```ts
getVectorArray(value: unknown, size?: number): VectorArray | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert. |
| `size` | `number` | The exact number of items the vector must have, or `undefined` for any size. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `VectorArray \| undefined` | The vector, or `undefined` if the value is not a vector of that size. |

## Examples

```ts
getVectorArray([0.5, -0.5]) // Float32Array [0.5, -0.5]
```

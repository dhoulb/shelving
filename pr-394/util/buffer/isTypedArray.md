# isTypedArray()

- Kind: function
- Import: `import { isTypedArray } from "shelving/util/buffer";`

Detect if an unknown value is a `TypedArray`, like `Uint8Array` or `Float32Array` (not including `DataView`).

## Signatures

```ts
isTypedArray(value: unknown): value is TypedArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is TypedArray` | `true` if `value` is a numeric `TypedArray`, narrowing its type. |

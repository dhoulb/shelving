# isBuffer()

- Kind: function
- Import: `import { isBuffer } from "shelving/util/buffer";`

Detect if an unknown value is an `ArrayBuffer` (not a view like `Uint8Array` or `Float32Array` or `DataView`).

## Signatures

```ts
isBuffer(value: unknown): value is ArrayBuffer
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ArrayBuffer` | `true` if `value` is an `ArrayBuffer`, narrowing its type. |

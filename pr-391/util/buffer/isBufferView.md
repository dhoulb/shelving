# isBufferView()

- Kind: function
- Import: `import { isBufferView } from "shelving/util/buffer";`

Detect if an unknown value is an `ArrayBufferView`, like `Uint8Array` or `Float32Array` or `DataView`.

## Signatures

```ts
isBufferView(value: unknown): value is ArrayBufferView
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ArrayBufferView` | `true` if `value` is an `ArrayBufferView`, narrowing its type. |

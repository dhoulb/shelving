# Buffer helpers

Type guards for `ArrayBuffer`, `ArrayBufferView`, and typed arrays. Use these when a function receives an unknown binary value and needs to distinguish between a raw buffer and its various view types.

## Usage

```ts
import { isBuffer, isBufferView, isTypedArray } from "shelving/util";

isBuffer(new ArrayBuffer(8));     // true
isBuffer(new Uint8Array(8));      // false — it's a view, not a buffer

isBufferView(new Uint8Array(8));  // true
isBufferView(new DataView(buf));  // true
isBufferView(new ArrayBuffer(8)); // false

isTypedArray(new Float32Array(4)); // true
isTypedArray(new DataView(buf));   // false — DataView is a view but not a typed array
```

The `TypedArray` type exported from this file covers all numeric typed array classes (`Uint8Array`, `Uint16Array`, `Uint32Array`, `Int8Array`, `Int16Array`, `Int32Array`, `Float32Array`, `Float64Array`).

## See also

- [bytes](/util/bytes) — `Uint8Array`-specific helpers with conversion and assertion support
- [util](/util)

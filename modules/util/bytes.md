# Byte sequence helpers

Type guards, conversion, and assertion for `Uint8Array<ArrayBuffer>` byte sequences. Used throughout the library wherever raw binary data is accepted — cryptographic operations, Base64 encoding, and binary I/O.

- The [`Bytes`](/util/bytes/Bytes) type is an alias for `Uint8Array<ArrayBuffer>` specifically. A `Uint8Array` backed by a `SharedArrayBuffer` does **not** satisfy it.
- [`getBytes()`](/util/bytes/getBytes) accepts a `string` (UTF-8 encoded), `ArrayBuffer`, or an existing `Bytes` and returns a `Bytes` — or `undefined` for anything else.

## Usage

### Type guard and assertion

```ts
import { isBytes, assertBytes } from "shelving/util";

isBytes(new Uint8Array(4));    // true
isBytes(new Uint8Array(4).buffer); // false — that's an ArrayBuffer

assertBytes(value);            // throws RequiredError if not a Bytes
assertBytes(value, 16, 64);   // also enforces byte-length bounds
```

### Converting to bytes

```ts
import { getBytes, requireBytes } from "shelving/util";

getBytes("hello");                       // Uint8Array (UTF-8)
getBytes(new ArrayBuffer(8));            // Uint8Array wrapping the buffer
getBytes(new Uint8Array([1, 2, 3]));     // returned as-is
getBytes(42);                            // undefined

requireBytes("hello");                   // same as getBytes but throws on failure
requireBytes(value, 8);                  // also requires at least 8 bytes
```

## See also

- [base64](/util/base64) — encode/decode [`Bytes`](/util/bytes/Bytes) to Base64 strings
- [buffer](/util/buffer) — broader typed-array type guards (`ArrayBuffer`, `DataView`, etc.)
- [util](/util)

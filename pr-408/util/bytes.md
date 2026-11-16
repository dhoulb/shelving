# shelving/util/bytes

- Kind: module
- Import: `import { … } from "shelving/util/bytes";`

Type guards, conversion, and assertion for `Uint8Array<ArrayBuffer>` byte sequences. Used throughout the library wherever raw binary data is accepted — cryptographic operations, Base64 encoding, and binary I/O.

- The `Bytes` type is an alias for `Uint8Array<ArrayBuffer>` specifically. A `Uint8Array` backed by a `SharedArrayBuffer` does **not** satisfy it.
- `getBytes()` accepts a `string` (UTF-8 encoded), `ArrayBuffer`, or an existing `Bytes` and returns a `Bytes` — or `undefined` for anything else.

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


## Functions

- [isBytes()](bytes/isBytes.md): Is an unknown value a set of bytes?
- [assertBytes()](bytes/assertBytes.md): Assert that an unknown value is a Uint8Array byte sequence (optionally with a min/max length).
- [getBytes()](bytes/getBytes.md): Convert an unknown value to a Uint8Array<ArrayBuffer> byte sequence, or undefined if the value cannot be converted.
- [requireBytes()](bytes/requireBytes.md): Convert a possible set of bytes to a Uint8Array byte sequence, or throw RequiredError if the value cannot be converted.

## Types

- [Bytes](bytes/Bytes.md): A set of bytes stored as a Uint8Array byte sequence backed by an ArrayBuffer.
- [PossibleBytes](bytes/PossibleBytes.md): Types that can be converted to a Uint8Array byte sequence.

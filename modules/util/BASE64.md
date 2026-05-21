# Base64 encoding

Encode and decode data to and from standard Base64 and URL-safe Base64 (Base64URL). Useful for binary payloads, JWTs, cryptographic keys, and any context that needs ASCII-safe binary representation.

- Both decoders accept either alphabet (standard `+/` or URL-safe `-_`), so you can call any decode function on either variant.
- Encoding defaults to padding (`=`) for standard Base64 and no padding for Base64URL, matching common conventions.
- Strings are encoded as UTF-8.

## Usage

### Standard Base64

```ts
import { encodeBase64, decodeBase64String, decodeBase64Bytes } from "shelving/util";

encodeBase64("hello");           // "aGVsbG8="
encodeBase64("hello", false);   // "aGVsbG8"  (no padding)

decodeBase64String("aGVsbG8="); // "hello"
decodeBase64Bytes("aGVsbG8=");  // Uint8Array
```

### URL-safe Base64 (Base64URL)

```ts
import { encodeBase64URL, decodeBase64URLString, decodeBase64URLBytes } from "shelving/util";

encodeBase64URL("hello");            // "aGVsbG8"  (no padding by default)
encodeBase64URL("hello", true);     // "aGVsbG8="

decodeBase64URLString("aGVsbG8");   // "hello"
decodeBase64URLBytes("aGVsbG8");    // Uint8Array
```

### Encoding binary data

All encode functions accept a `string`, `ArrayBuffer`, or `Uint8Array` (`PossibleBytes`):

```ts
import { encodeBase64URL } from "shelving/util";

const key = crypto.getRandomValues(new Uint8Array(32));
const token = encodeBase64URL(key);
```

## See also

- [bytes](/util/BYTES) — the `Bytes` / `PossibleBytes` types used as encode input
- [util](/util)

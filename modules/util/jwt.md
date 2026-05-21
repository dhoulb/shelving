# JWT helpers

Encode, decode, and verify JSON Web Tokens signed with HMAC SHA-512. Also provides convenience helpers for reading and writing Bearer tokens on `Request` objects.

**Things to know:**

- Only HMAC SHA-512 (`HS512`) is supported — the algorithm is fixed.
- Secrets must be at least 64 bytes (512 bits); shorter values throw `ValueError`.
- `exp` defaults to 30 days from "now"; `nbf` and `iat` both default to "now".
- Verification allows a 1-minute clock skew for `nbf`/`exp`.
- Expired or tampered tokens throw `UnauthorizedError`, not a generic error.

## Usage

### Signing and verifying tokens

```ts
import { encodeToken, verifyToken } from "shelving/util";

const secret = crypto.getRandomValues(new Uint8Array(64));

// Create a token with custom claims.
const token = await encodeToken({ sub: "user_123", role: "admin" }, secret);

// Verify and decode — returns the payload as Data.
const payload = await verifyToken(token, secret);
// { sub: "user_123", role: "admin", nbf: ..., iat: ..., exp: ... }
```

### Parsing a token without verifying

```ts
import { splitToken } from "shelving/util";

const { headerData, payloadData } = splitToken(token);
```

### Working with Bearer tokens on requests

```ts
import {
  setRequestToken,
  getRequestToken,
  requireRequestToken,
  verifyRequestToken,
} from "shelving/util";

// Attach a token to an outgoing request.
setRequestToken(request, token);

// Read the raw token string from an incoming request (or undefined).
const raw = getRequestToken(request);

// Read and verify in one step — throws UnauthorizedError if missing or invalid.
const claims = await verifyRequestToken(request, secret);
```

## See also

- [util](/util) — full util module overview.

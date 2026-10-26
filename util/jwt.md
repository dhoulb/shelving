# shelving/util/jwt

- Kind: module
- Import: `import { … } from "shelving/util/jwt";`

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


## Functions

- [encodeToken()](jwt/encodeToken.md): Encode a JWT and return the string token.
- [splitToken()](jwt/splitToken.md): Split a JSON Web Token into its header, payload, and signature, and decode and parse the JSON.
- [verifyToken()](jwt/verifyToken.md): Decode a JWT, verify it, and return the full payload data.
- [setRequestToken()](jwt/setRequestToken.md): Set the Authorization: Bearer {token} on a Request object (by reference).
- [getRequestToken()](jwt/getRequestToken.md): Extract the Authorization: Bearer {token} from a Request object, or return undefined if not set.
- [requireRequestToken()](jwt/requireRequestToken.md): Extract the Authorization: Bearer {token} from a Request object, or throw UnauthorizedError if not set or malformed.
- [verifyRequestToken()](jwt/verifyRequestToken.md): Extract the Authorization: Bearer {token} from a Request object and verify it using a signature, or throw UnauthorizedError if not set, malformed, or invalid.

## Interfaces

- [TokenClaims](jwt/TokenClaims.md): Claims payload accepted when encoding a JWT.

## Types

- [TokenData](jwt/TokenData.md): Parts that make up a JSON Web Token — the raw encoded segments plus their decoded contents.

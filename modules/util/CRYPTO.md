# Password hashing and random bytes

Secure password hashing and verification using PBKDF2-SHA-512, plus a helper for generating cryptographically random bytes. Uses the Web Crypto API so it works in browsers, Node.js, and edge runtimes without additional dependencies.

- `hashPassword` generates a fresh random salt each call — two hashes of the same password will never match each other directly.
- The stored hash format is `salt$iterations$hash` (all base64url-encoded), roughly 128 characters long.
- Passwords shorter than 6 characters are rejected with a `ValueError`.
- Default iteration count is 500,000; you can lower it for tests but not below 1.
- Comparison in `verifyPassword` is constant-time to prevent timing attacks.

## Usage

### Hashing and verifying a password

```ts
import { hashPassword, verifyPassword } from "shelving/util";

// On sign-up — store the returned string in your database.
const stored = await hashPassword("correct-horse-battery");

// On sign-in — compare the plain-text password against the stored hash.
const ok = await verifyPassword("correct-horse-battery", stored); // true
const bad = await verifyPassword("wrong-password", stored);       // false
```

### Generating random bytes

```ts
import { getRandomBytes } from "shelving/util";

const token = getRandomBytes(32); // Uint8Array of 32 random bytes
```

## See also

- [util](/util) — full util module overview
- [base64](/util/BASE64) — base64url encoding used internally by this module

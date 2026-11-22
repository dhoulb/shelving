# verifyToken()

- Kind: function
- Import: `import { verifyToken } from "shelving/util/jwt";`

Decode a JWT, verify it, and return the full payload data.
- Currently only supports HMAC SHA-512 signing.
- Allows a small amount of clock skew when checking `nbf` and `exp`.

## Signatures

```ts
verifyToken(token: string, secret: PossibleBytes, caller: AnyCaller = verifyToken): Promise<Data>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `token` | `string` | The JWT string to verify. |
| `secret` | `PossibleBytes` | The secret key to verify the JWT signature with (minimum 64 bytes / 512 bits). |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `verifyToken`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<Data>` | A promise resolving to the decoded payload claims. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` If the `secret` is not a byte sequence of at least 64 bytes. |
| `unknown` | `UnauthorizedError` If the token is malformed, the signature is incorrect, or the token is expired or not yet valid. |

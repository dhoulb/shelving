# encodeToken()

- Kind: function
- Import: `import { encodeToken } from "shelving/util/jwt";`

Encode a JWT and return the string token.
- Currently only supports HMAC SHA-512 signing.
- The `exp` claim defaults to 30 days from now, and `iat` / `nbf` default to "now".

## Signatures

```ts
encodeToken({ nbf = "now", iat = "now", exp = DAY * 30, ...claims }: TokenClaims, secret: PossibleBytes): Promise<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `claims` | `TokenClaims` | The payload claims to include in the JWT, including optional `iat`, `nbf`, and `exp` values. |
| `.iat` | `PossibleDate` | "Issued at" date (defaults to "now"). - Not used for validation, but always set in the token payload. - Can be used to determine when the token was issued, and possibly revoke tokens issued before a certain date. Read only. Optional. |
| `.nbf` | `PossibleDate` | "Not before" date. - When validating the token, tokens before this date will be rejected Read only. Optional. |
| `.exp` | `number` | Expiry in milliseconds (defaults to "30 days"). - When validating the token, tokens after this date will be rejected Read only. Optional. |
| `secret` | `PossibleBytes` | The secret key to sign the JWT with (minimum 64 bytes / 512 bits). |

## Returns

| Type | Description |
| --- | --- |
| `Promise<string>` | A promise resolving to the signed JWT string token. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` If the `secret` is not a byte sequence of at least 64 bytes. |

# verifyPassword()

- Kind: function
- Import: `import { verifyPassword } from "shelving/util/crypto";`

Verify a password against a stored salt$iterations$hash string using PBKDF2.

## Signatures

```ts
verifyPassword(password: string, hash: string): Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `password` | `string` | The password to verify. |
| `hash` | `string` | String in the format `salt$iterations$hash`, where `salt` and `hash` are base64-encoded. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<boolean>` | True if the password matches the hash, false otherwise. - Returns `false` (never throws) for malformed hash strings or invalid iteration counts. |

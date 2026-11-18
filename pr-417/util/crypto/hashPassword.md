# hashPassword()

- Kind: function
- Import: `import { hashPassword } from "shelving/util/crypto";`

Hash a password using PBKDF2, generating a new salt, and return the combined salt$iterations$hash string.

## Signatures

```ts
hashPassword(password: string, iterations = ITERATIONS): Promise<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `password` | `string` | The password to hash. |
| `iterations` | `unknown` | The number of iterations. Defaults to `ITERATIONS`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<string>` | Hash in the format `salt$iterations$hash`, where `salt` and `hash` are base64-encoded. - Returned hash tring will be about 128 characters long (16 byte salt + iteration count + 64 byte hash + 2 separators = 116 characters once base64 encoded). |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If the password is shorter than the minimum length, or `iterations` is less than 1. |

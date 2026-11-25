# splitToken()

- Kind: function
- Import: `import { splitToken } from "shelving/util/jwt";`

Split a JSON Web Token into its header, payload, and signature, and decode and parse the JSON.
- Does not verify the signature — use `verifyToken()` for that.

## Signatures

```ts
splitToken(token: string, caller: AnyCaller = splitToken): TokenData
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `token` | `string` | The JWT string to split and decode. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `splitToken`. |

## Returns

| Type | Description |
| --- | --- |
| `TokenData` | A `TokenData` object with the raw segments and their decoded header, payload, and signature. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `UnauthorizedError` If the token is malformed, or its segments are not valid Base64URL-encoded JSON. |

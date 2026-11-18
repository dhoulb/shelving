# verifyRequestToken()

- Kind: function
- Import: `import { verifyRequestToken } from "shelving/util/jwt";`

Extract the `Authorization: Bearer {token}` from a `Request` object and verify it using a signature, or throw `UnauthorizedError` if not set, malformed, or invalid.
- Same as doing `requireRequestToken()` and then `verifyToken()`.

## Signatures

```ts
verifyRequestToken(request: Request, secret: PossibleBytes, caller: AnyCaller = verifyRequestToken): Promise<Data>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` object containing an `Authorization: Bearer {token}` header to extract the token from. |
| `secret` | `PossibleBytes` | The secret key to verify the JWT signature with. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `verifyRequestToken`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<Data>` | A promise resolving to the decoded payload data from the JWT. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `UnauthorizedError` If the `Authorization` header is not set, the JWT it contains is not well-formed, or the JWT signature is invalid. |

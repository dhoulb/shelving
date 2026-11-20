# requireRequestToken()

- Kind: function
- Import: `import { requireRequestToken } from "shelving/util/jwt";`

Extract the `Authorization: Bearer {token}` from a `Request` object, or throw `UnauthorizedError` if not set or malformed.

## Signatures

```ts
requireRequestToken(request: Request, caller: AnyCaller = requireRequestToken): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` object containing an `Authorization: Bearer {token}` header to extract the token from. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `requireRequestToken`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The string token extracted from the `Authorization` header. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `UnauthorizedError` If the `Authorization` header is not set, or the JWT it contains is not well-formed. |

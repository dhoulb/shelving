# setRequestToken()

- Kind: function
- Import: `import { setRequestToken } from "shelving/util/jwt";`

Set the `Authorization: Bearer {token}` on a `Request` object (by reference).

## Signatures

```ts
setRequestToken(request: Request, token: string): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` object to set the token on. |
| `token` | `string` | The JWT string to set in the `Authorization` header. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | The same `Request` object that was passed in. |

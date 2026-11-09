# getRequestToken()

- Kind: function
- Import: `import { getRequestToken } from "shelving/util/jwt";`

Extract the `Authorization: Bearer {token}` from a `Request` object, or return `undefined` if not set.

## Signatures

```ts
getRequestToken(request: Request): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` object possibly containing an `Authorization: Bearer {token}` header to extract the token from. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The string token extracted from the `Authorization` header, or `undefined` if not set. |

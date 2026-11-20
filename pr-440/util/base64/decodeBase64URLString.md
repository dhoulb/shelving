# decodeBase64URLString()

- Kind: function
- Import: `import { decodeBase64URLString } from "shelving/util/base64";`

Decode a string from a URL-safe Base64 string (decodes Base64 too).

## Signatures

```ts
decodeBase64URLString(base64: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `base64` | `string` | The Base64URL (or Base64) string to decode. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The decoded UTF-8 string. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `base64` contains an invalid character. |

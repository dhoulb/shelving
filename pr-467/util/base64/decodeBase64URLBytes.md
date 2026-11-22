# decodeBase64URLBytes()

- Kind: function
- Import: `import { decodeBase64URLBytes } from "shelving/util/base64";`

Decode a URL-safe Base64 string to a byte sequence (decodes Base64 too).

## Signatures

```ts
decodeBase64URLBytes(base64: string): Bytes
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `base64` | `string` | The Base64URL (or Base64) string to decode. |

## Returns

| Type | Description |
| --- | --- |
| `Bytes` | The decoded byte sequence. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `base64` contains an invalid character. |

# decodeBase64Bytes()

- Kind: function
- Import: `import { decodeBase64Bytes } from "shelving/util/base64";`

Decode a Base64 string to a byte sequence (decodes Base64URL too).

## Signatures

```ts
decodeBase64Bytes(base64: string): Bytes
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `base64` | `string` | The Base64 (or Base64URL) string to decode. |

## Returns

| Type | Description |
| --- | --- |
| `Bytes` | The decoded byte sequence. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `base64` contains an invalid character. |

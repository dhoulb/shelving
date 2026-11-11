# decodeBase64String()

- Kind: function
- Import: `import { decodeBase64String } from "shelving/util/base64";`

Decode a Base64 string to a string (decodes Base64URL too).

## Signatures

```ts
decodeBase64String(base64: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `base64` | `string` | The Base64 (or Base64URL) string to decode. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The decoded UTF-8 string. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `base64` contains an invalid character. |

# encodeBase64URL()

- Kind: function
- Import: `import { encodeBase64URL } from "shelving/util/base64";`

Encode a string or binary data to a URL-safe Base64 string.

## Signatures

```ts
encodeBase64URL(input: PossibleBytes, pad = false): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `PossibleBytes` | The string or byte data to encode. |
| `pad` | `unknown` | Whether to append `=` padding characters (defaults to `false`). Defaults to `false`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The Base64URL-encoded string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `input` cannot be converted to a byte sequence. |

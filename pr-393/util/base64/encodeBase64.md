# encodeBase64()

- Kind: function
- Import: `import { encodeBase64 } from "shelving/util/base64";`

Encode a string or binary data to a Base64 string.

## Signatures

```ts
encodeBase64(input: PossibleBytes, pad = true): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `PossibleBytes` | The string or byte data to encode. |
| `pad` | `unknown` | Whether to append `=` padding characters (defaults to `true`). Defaults to `true`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The Base64-encoded string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `input` cannot be converted to a byte sequence. |

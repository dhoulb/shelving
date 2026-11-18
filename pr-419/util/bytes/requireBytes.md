# requireBytes()

- Kind: function
- Import: `import { requireBytes } from "shelving/util/bytes";`

Convert a possible set of bytes to a `Uint8Array` byte sequence, or throw `RequiredError` if the value cannot be converted.

## Signatures

```ts
requireBytes(value: PossibleBytes, min = 0, max = Number.POSITIVE_INFINITY, caller: AnyCaller = requireBytes): Uint8Array<ArrayBuffer>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleBytes` | The possible bytes to convert. |
| `min` | `unknown` | Minimum allowed length (defaults to `0`). Defaults to `0`. |
| `max` | `unknown` | Maximum allowed length (defaults to `Infinity`). Defaults to `Number.POSITIVE_INFINITY`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireBytes` itself). Defaults to `requireBytes`. |

## Returns

| Type | Description |
| --- | --- |
| `Uint8Array<ArrayBuffer>` | The converted byte sequence. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` cannot be converted or is outside the allowed length range. |

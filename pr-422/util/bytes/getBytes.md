# getBytes()

- Kind: function
- Import: `import { getBytes } from "shelving/util/bytes";`

Convert an unknown value to a `Uint8Array<ArrayBuffer>` byte sequence, or `undefined` if the value cannot be converted.

- `Uint8Array` values are returned as-is (if backed by an `ArrayBuffer`) or copied to a new `Uint8Array` (if not).
- `ArrayBuffer` instances are converted to `Uint8Array`
- Strings are encoded as UTF-8 characters in a `Uint8Array`
- Everything else returns `undefined`

## Signatures

```ts
getBytes(value: unknown): Uint8Array<ArrayBuffer> | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert. |

## Returns

| Type | Description |
| --- | --- |
| `Uint8Array<ArrayBuffer> \| undefined` | The byte sequence, or `undefined` if `value` cannot be converted. |

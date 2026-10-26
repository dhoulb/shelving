# isBytes()

- Kind: function
- Import: `import { isBytes } from "shelving/util/bytes";`

Is an unknown value a set of bytes?

## Signatures

```ts
isBytes(value: unknown): value is Bytes
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is Bytes` | `true` if `value` is a `Uint8Array` backed by an `ArrayBuffer`, narrowing its type. |

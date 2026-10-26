# getRandomBytes()

- Kind: function
- Import: `import { getRandomBytes } from "shelving/util/crypto";`

Get cryptographically-random bytes from the platform crypto API.

## Signatures

```ts
getRandomBytes(length: number): Bytes
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `length` | `number` | The number of random bytes to generate. |

## Returns

| Type | Description |
| --- | --- |
| `Bytes` | A `Bytes` (`Uint8Array`) of the requested length filled with random values. |

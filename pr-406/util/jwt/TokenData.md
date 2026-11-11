# TokenData

- Kind: type
- Import: `import { TokenData } from "shelving/util/jwt";`

Parts that make up a JSON Web Token — the raw encoded segments plus their decoded contents.

## Signatures

```ts
{
	header: string;
	payload: string;
	signature: string;
	headerData: Data;
	payloadData: Data;
	signatureBytes: Bytes;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `header` | `string` |  |
| `payload` | `string` |  |
| `signature` | `string` |  |
| `headerData` | `Data` |  |
| `payloadData` | `Data` |  |
| `signatureBytes` | `Bytes` |  |

## Types

- [Data](../data/Data.md): Data object — a plain object with string keys and unknown values.
- [Bytes](../bytes/Bytes.md): A set of bytes stored as a Uint8Array byte sequence backed by an ArrayBuffer.

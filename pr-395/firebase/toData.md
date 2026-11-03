# toData()

- Kind: function
- Import: `import { toData } from "shelving/firebase";`

Convert Firestore REST API document fields back to a data object.

## Signatures

```ts
toData(fields: FirestoreFields | undefined, caller: AnyCaller = toData): Data
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `fields` | `FirestoreFields \| undefined` | The Firestore fields object to convert (missing means an empty document). |
| `caller` | `AnyCaller` | Caller function used to attribute thrown errors. Defaults to `toData`. |

## Returns

| Type | Description |
| --- | --- |
| `Data` | The plain data object. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if any field value has no recognised type. |

## Examples

```ts
toData({ num: { integerValue: "123" } }) // { num: 123 }
```

# toFirestoreFields()

- Kind: function
- Import: `import { toFirestoreFields } from "shelving/firebase";`

Convert a data object to Firestore REST API document fields.

- Props with `undefined` value are skipped (matching JSON serialisation).

## Signatures

```ts
toFirestoreFields(data: Data, caller: AnyCaller = toFirestoreFields): FirestoreFields
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `Data` | The data object to convert. |
| `caller` | `AnyCaller` | Caller function used to attribute thrown errors. Defaults to `toFirestoreFields`. |

## Returns

| Type | Description |
| --- | --- |
| `FirestoreFields` | The Firestore fields object. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if any prop value cannot be represented. |

## Examples

```ts
toFirestoreFields({ num: 123 }) // { num: { integerValue: "123" } }
```

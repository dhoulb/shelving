# FirestoreValue

- Kind: type
- Import: `import { FirestoreValue } from "shelving/firebase";`

JSON representation of a single value in the Firestore REST API.

## Signatures

```ts
{
	readonly nullValue?: null;
	readonly booleanValue?: boolean;
	readonly integerValue?: string | number;
	readonly doubleValue?: string | number;
	readonly stringValue?: string;
	readonly timestampValue?: string;
	readonly bytesValue?: string;
	readonly referenceValue?: string;
	readonly geoPointValue?: { readonly latitude?: number; readonly longitude?: number };
	readonly arrayValue?: { readonly values?: ImmutableArray<FirestoreValue> };
	readonly mapValue?: { readonly fields?: FirestoreFields };
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `nullValue` | `null` | Read only. Optional. |
| `booleanValue` | `boolean` | Read only. Optional. |
| `integerValue` | `string \| number` | Read only. Optional. |
| `doubleValue` | `string \| number` | Read only. Optional. |
| `stringValue` | `string` | Read only. Optional. |
| `timestampValue` | `string` | Read only. Optional. |
| `bytesValue` | `string` | Read only. Optional. |
| `referenceValue` | `string` | Read only. Optional. |
| `geoPointValue` | `{ readonly latitude?: number; readonly longitude?: number }` | Read only. Optional. |
| `arrayValue` | `{ readonly values?: ImmutableArray<FirestoreValue> }` | Read only. Optional. |
| `mapValue` | `{ readonly fields?: FirestoreFields }` | Read only. Optional. |

## Types

- [ImmutableArray](../util/array/ImmutableArray.md): Immutable array: an array that cannot be changed.
- [FirestoreValue](FirestoreValue.md): JSON representation of a single value in the Firestore REST API.
- [FirestoreFields](FirestoreFields.md): JSON representation of the fields of a Firestore document in the Firestore REST API.

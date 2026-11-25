# toFirestoreVector()

- Kind: function
- Import: `import { toFirestoreVector } from "shelving/firebase";`

Convert a `VectorArray` to a Firestore vector value, for a vector field or a `findNearest` query.
- Every number is a `doubleValue`, because Firestore refuses a vector that holds an `integerValue`.

## Signatures

```ts
toFirestoreVector(vector: VectorArray): FirestoreValue
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `vector` | `VectorArray` | The vector to convert. |

## Returns

| Type | Description |
| --- | --- |
| `FirestoreValue` | The Firestore vector value. |

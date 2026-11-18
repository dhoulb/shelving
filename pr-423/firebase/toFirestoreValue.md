# toFirestoreValue()

- Kind: function
- Import: `import { toFirestoreValue } from "shelving/firebase";`

Convert a data value to its Firestore REST API JSON representation.

- Safe integers become `integerValue` (which the REST API encodes as a string), other finite numbers become `doubleValue`.
- Arrays and plain objects convert recursively.

## Signatures

```ts
toFirestoreValue(value: unknown, caller: AnyCaller = toFirestoreValue): FirestoreValue
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert (null, boolean, string, finite number, array, or plain object). |
| `caller` | `AnyCaller` | Caller function used to attribute thrown errors. Defaults to `toFirestoreValue`. |

## Returns

| Type | Description |
| --- | --- |
| `FirestoreValue` | The Firestore JSON value. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if the value cannot be represented (e.g. `undefined`, functions, non-finite numbers, class instances). |

## Examples

```ts
toFirestoreValue(123) // { integerValue: "123" }
```

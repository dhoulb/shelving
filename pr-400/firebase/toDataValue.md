# toDataValue()

- Kind: function
- Import: `import { toDataValue } from "shelving/firebase";`

Convert a Firestore REST API JSON value back to a data value.

- `integerValue` parses to a `number`, so integers beyond `Number.MAX_SAFE_INTEGER` lose precision.
- `timestampValue`, `bytesValue`, and `referenceValue` pass through as their string form; `geoPointValue` becomes a plain `{ latitude, longitude }` object — wrap the provider in `ValidationDBProvider` to reject types your schemas don't allow.

## Signatures

```ts
toDataValue(value: FirestoreValue, caller: AnyCaller = toDataValue): unknown
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `FirestoreValue` | The Firestore JSON value to convert. |
| `.nullValue` | `null` | Read only. Optional. |
| `.booleanValue` | `boolean` | Read only. Optional. |
| `.integerValue` | `string \| number` | Read only. Optional. |
| `.doubleValue` | `string \| number` | Read only. Optional. |
| `.stringValue` | `string` | Read only. Optional. |
| `.timestampValue` | `string` | Read only. Optional. |
| `.bytesValue` | `string` | Read only. Optional. |
| `.referenceValue` | `string` | Read only. Optional. |
| `.geoPointValue` | `{ readonly latitude?: number; readonly longitude?: number }` | Read only. Optional. |
| `.arrayValue` | `{ readonly values?: ImmutableArray<FirestoreValue> }` | Read only. Optional. |
| `.mapValue` | `{ readonly fields?: FirestoreFields }` | Read only. Optional. |
| `caller` | `AnyCaller` | Caller function used to attribute thrown errors. Defaults to `toDataValue`. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | The plain data value. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if the value has no recognised type. |

## Examples

```ts
toDataValue({ integerValue: "123" }) // 123
```

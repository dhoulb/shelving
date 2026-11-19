# getObject()

- Kind: function
- Import: `import { getObject } from "shelving/util/object";`

Turn a possible object into an object.
- If the value is iterable it is converted to an object using `Object.fromEntries()`, otherwise it is returned as-is.

## Signatures

```ts
getObject(obj: PossibleObject<T>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `PossibleObject<T>` | The object or iterable set of key/value entry tuples to convert. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The corresponding object. |

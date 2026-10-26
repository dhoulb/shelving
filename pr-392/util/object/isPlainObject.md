# isPlainObject()

- Kind: function
- Import: `import { isPlainObject } from "shelving/util/object";`

Is an unknown value a plain object?
- A plain object is one whose prototype is `Object.prototype` or `null` (i.e. not a class instance).

## Signatures

```ts
isPlainObject(value: unknown): value is ImmutableObject
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableObject` | `true` if `value` is a plain object, narrowing its type. |

# assertProp()

- Kind: function
- Import: `import { assertProp } from "shelving/util/object";`

Assert that an unknown value is the key for an own prop of an object.

## Signatures

```ts
assertProp(obj: T, key: PropertyKey): asserts key is keyof T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to assert against. |
| `key` | `PropertyKey` | The key to assert is an own prop. |

## Returns

| Type | Description |
| --- | --- |
| `asserts key is keyof T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `key` is not an own prop of `obj`. |

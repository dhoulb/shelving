# assertVectorArray()

- Kind: function
- Import: `import { assertVectorArray } from "shelving/util/vector";`

Assert that an unknown value is a `VectorArray` (optionally with an exact size).

## Signatures

```ts
assertVectorArray(value: unknown, size?: number, caller: AnyCaller = assertVectorArray): asserts value is VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |
| `size` | `number` | The exact number of items the vector must have, or `undefined` for any size. Optional. |
| `caller` | `AnyCaller` | Defaults to `assertVectorArray`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is VectorArray` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the value is not a `Float32Array` of that size. |

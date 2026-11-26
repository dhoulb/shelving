# requireVectorArray()

- Kind: function
- Import: `import { requireVectorArray } from "shelving/util/vector";`

Get a `VectorArray` from a possible vector, or throw if the value is not one.

## Signatures

```ts
requireVectorArray(value: unknown, size?: number, caller: AnyCaller = requireVectorArray): VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to convert (see `getVectorArray()` for the shapes it takes). |
| `size` | `number` | The exact number of items the vector must have, or `undefined` for any size. Optional. |
| `caller` | `AnyCaller` | Defaults to `requireVectorArray`. |

## Returns

| Type | Description |
| --- | --- |
| `VectorArray` | The vector. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the value is not a vector of that size. |

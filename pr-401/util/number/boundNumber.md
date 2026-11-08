# boundNumber()

- Kind: function
- Import: `import { boundNumber } from "shelving/util/number";`

Bound a number between two values.
- e.g. `12` bounded by `2` and `8` is `8`

## Signatures

```ts
boundNumber(num: number, min: number, max: number): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | The number to bound. |
| `min` | `number` | The minimum bound, inclusive. |
| `max` | `number` | The maximum bound, inclusive. |

## Returns

| Type | Description |
| --- | --- |
| `number` | `num` clamped to lie between `min` and `max`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if `max` is less than `min`. |

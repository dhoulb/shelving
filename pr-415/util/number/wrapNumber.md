# wrapNumber()

- Kind: function
- Import: `import { wrapNumber } from "shelving/util/number";`

Wrap a number between two values.
- Numbers wrap around between min and max (like a clock).
- e.g. `12` bounded by `2` and `8` is `6`
- Words in both directions.
- e.g. `-2` bounded by `2` and `8` is `4`

## Signatures

```ts
wrapNumber(num: number, min: number, max: number): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | The number to wrap. |
| `min` | `number` | The minimum bound, inclusive. |
| `max` | `number` | The maximum bound, exclusive (values wrap back to `min`). |

## Returns

| Type | Description |
| --- | --- |
| `number` | `num` wrapped to lie between `min` and `max`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if `max` is less than `min`. |

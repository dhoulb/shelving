# roundStep()

- Kind: function
- Import: `import { roundStep } from "shelving/util/number";`

Round numbers to a given step.

## Signatures

```ts
roundStep(num: number, step = 1): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | The number to round. |
| `step` | `unknown` | The rounding to round to, e.g. `2` or `0.1` (defaults to `1`, i.e. round numbers). Defaults to `1`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | The number rounded to the specified step. |

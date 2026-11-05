# getPercent()

- Kind: function
- Import: `import { getPercent } from "shelving/util/number";`

Get a number as a percentage of another number.

## Signatures

```ts
getPercent(numerator: number, denumerator = 100): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `numerator` | `number` | Number representing the amount of progress. |
| `denumerator` | `unknown` | The number representing the whole amount (defaults to 100). Defaults to `100`. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | `numerator` expressed as a percentage of `denumerator`. |

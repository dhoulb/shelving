# hashStringBetween()

- Kind: function
- Import: `import { hashStringBetween } from "shelving/util/hash";`

Hash a string into an idempotent number wrapped between two values.
- Useful for deterministically mapping a string into a fixed range, e.g. a colour or bucket index.

## Signatures

```ts
hashStringBetween(str: string, min = 0, max = 256): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to hash. |
| `min` | `unknown` | The inclusive lower bound of the output range. Defaults to `0`. Defaults to `0`. |
| `max` | `unknown` | The exclusive upper bound of the output range. Defaults to `256`. Defaults to `256`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | A number in the range `min` to `max` derived from the string. |

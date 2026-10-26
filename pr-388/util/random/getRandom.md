# getRandom()

- Kind: function
- Import: `import { getRandom } from "shelving/util/random";`

Generate a random integer between two numbers (inclusive).

## Signatures

```ts
getRandom(min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `min` | `number` | Lowest possible integer to return — defaults to `Number.MIN_SAFE_INTEGER`. Defaults to `Number.MIN_SAFE_INTEGER`. |
| `max` | `number` | Highest possible integer to return — defaults to `Number.MAX_SAFE_INTEGER`. Defaults to `Number.MAX_SAFE_INTEGER`. |

## Returns

| Type | Description |
| --- | --- |
| `number` | Random integer in the range `min` to `max` (inclusive). |

# getRandomExcept()

- Kind: function
- Import: `import { getRandomExcept } from "shelving/util/random";`

Get a random integer that is anything except an existing number.
- Repeatedly draws a random integer until it differs from `existing`.

## Signatures

```ts
getRandomExcept(existing: number, min?: number, max?: number): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `existing` | `number` | Number that must not be returned. |
| `min` | `number` | Lowest possible integer to return — defaults to `Number.MIN_SAFE_INTEGER`. Optional. |
| `max` | `number` | Highest possible integer to return — defaults to `Number.MAX_SAFE_INTEGER`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | Random integer in the range `min` to `max` that is not equal to `existing`. |

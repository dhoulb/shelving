# hashString()

- Kind: function
- Import: `import { hashString } from "shelving/util/hash";`

Hash a string into an idempotent number.
- Sums the char codes of every character, so the same string always produces the same number.
- Not cryptographically secure — intended for cheap, stable bucketing.

## Signatures

```ts
hashString(str: string): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to hash. |

## Returns

| Type | Description |
| --- | --- |
| `number` | A non-negative number derived from the string's characters. |

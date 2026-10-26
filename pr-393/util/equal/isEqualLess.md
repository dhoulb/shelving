# isEqualLess()

- Kind: function
- Import: `import { isEqualLess } from "shelving/util/equal";`

Is unknown value `left` less than or equal to `right` (using `compareAscending()`)?

## Signatures

```ts
isEqualLess(left: unknown, right: unknown): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to compare. |
| `right` | `unknown` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | `true` if `left` sorts before or equal to `right`. |

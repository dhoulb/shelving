# isLess()

- Kind: function
- Import: `import { isLess } from "shelving/util/equal";`

Is unknown value `left` less than `right` (using `compareAscending()`)?

## Signatures

```ts
isLess(left: unknown, right: unknown): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to compare. |
| `right` | `unknown` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | `true` if `left` sorts before `right`. |

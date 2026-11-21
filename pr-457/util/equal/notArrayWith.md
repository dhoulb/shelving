# notArrayWith()

- Kind: function
- Import: `import { notArrayWith } from "shelving/util/equal";`

Is unknown value `left` not an array, or an array that does not include `right`?

## Signatures

```ts
notArrayWith(left: unknown, right: unknown): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check. |
| `right` | `unknown` | The item the array must include. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `left` is not an array or does not include `right`. |

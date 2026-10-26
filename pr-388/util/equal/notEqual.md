# notEqual()

- Kind: function
- Import: `import { notEqual } from "shelving/util/equal";`

Is unknown value `left` not exactly (referentially) equal to `right`?

## Signatures

```ts
notEqual(left: T | N, right: N): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `T \| N` | The value to check and narrow. |
| `right` | `N` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if the values are not strictly equal. |

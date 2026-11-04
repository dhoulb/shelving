# isEqual()

- Kind: function
- Import: `import { isEqual } from "shelving/util/equal";`

Is unknown value `left` exactly (referentially) equal to `right`?

## Signatures

```ts
isEqual(left: unknown, right: T): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if the values are strictly equal. |

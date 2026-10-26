# isDeepEqual()

- Kind: function
- Import: `import { isDeepEqual } from "shelving/util/equal";`

Are two unknown values deeply equal?
- If the values are both arrays/objects, see if the items/properties are **deeply** equal with each other.

## Signatures

```ts
isDeepEqual(left: unknown, right: T): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if the values are deeply equal. |

# isShallowEqual()

- Kind: function
- Import: `import { isShallowEqual } from "shelving/util/equal";`

Are two unknown values shallowly equal?
- If the values are both arrays/objects, see if the items/properties are **shallowly** equal with each other.

## Signatures

```ts
isShallowEqual(left: unknown, right: T): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if the values are shallowly equal. |

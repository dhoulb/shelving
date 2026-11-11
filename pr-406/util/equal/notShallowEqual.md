# notShallowEqual()

- Kind: function
- Import: `import { notShallowEqual } from "shelving/util/equal";`

Are two unknown values not shallowly equal?

## Signatures

```ts
notShallowEqual(left: unknown, right: T): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if the values are not shallowly equal. |

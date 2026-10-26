# notDeepEqual()

- Kind: function
- Import: `import { notDeepEqual } from "shelving/util/equal";`

Are two unknown values not deeply equal?

## Signatures

```ts
notDeepEqual(left: unknown, right: T): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The value to compare against. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if the values are not deeply equal. |

# isSetItem()

- Kind: function
- Import: `import { isSetItem } from "shelving/util/set";`

Is an unknown value an item in a set?

## Signatures

```ts
isSetItem(set: ImmutableSet<T>, item: unknown): item is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `set` | `ImmutableSet<T>` | The set to look in. |
| `item` | `unknown` | The value to check for membership. |

## Returns

| Type | Description |
| --- | --- |
| `item is T` | `true` if `item` exists in `set`, otherwise `false`. |

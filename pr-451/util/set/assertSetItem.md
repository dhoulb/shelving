# assertSetItem()

- Kind: function
- Import: `import { assertSetItem } from "shelving/util/set";`

Assert that an unknown value is an item in a set.

## Signatures

```ts
assertSetItem(set: ImmutableSet<T>, item: unknown, caller: AnyCaller = assertSetItem): asserts item is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `set` | `ImmutableSet<T>` | The set to look in. |
| `item` | `unknown` | The value to assert membership of. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertSetItem`). Defaults to `assertSetItem`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts item is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `item` does not exist in `set`. |

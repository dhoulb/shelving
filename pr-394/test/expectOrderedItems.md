# expectOrderedItems()

- Kind: function
- Import: `import { expectOrderedItems } from "shelving/test";`

Assert that a set of `Item` objects has exactly the expected `.id` values, in the exact given order.

- Compares ids positionally, so order is significant.
- On failure, rewrites the stack trace to point at the call site.

## Signatures

```ts
expectOrderedItems(items: Iterable<Item<I, T>>, keys: Iterable<string> & NotString): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<Item<I, T>>` | The items to check, each carrying an `.id` prop. |
| `keys` | `Iterable<string> & NotString` | The exact ordered sequence of `.id` values expected. |

## Throws

| Type | Description |
| --- | --- |
| `Error` | If the items' ids don't match `keys` in order. |

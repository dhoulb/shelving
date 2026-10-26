# expectUnorderedItems()

- Kind: function
- Import: `import { expectUnorderedItems } from "shelving/test";`

Assert that a set of `Item` objects has exactly the expected `.id` values, in any order.

- Sorts both sides before comparing, so iteration order is ignored.
- On failure, rewrites the stack trace to point at the call site.

## Signatures

```ts
expectUnorderedItems(items: Iterable<Item<I, T>>, keys: Iterable<string> & NotString): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<Item<I, T>>` | The items to check, each carrying an `.id` prop. |
| `keys` | `Iterable<string> & NotString` | The exact set of `.id` values expected (order ignored). |

## Throws

| Type | Description |
| --- | --- |
| `Error` | If the items' ids don't match `keys`. |

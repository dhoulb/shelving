# filterItems()

- Kind: function
- Import: `import { filterItems } from "shelving/util/filter";`

Filter an iterable set of items using a matcher.

## Signatures

```ts
filterItems(items: Iterable<T>, match: Match<[T, ...A]>, ...args: A): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | Iterable of items to filter. |
| `match` | `Match<[T, ...A]>` | Matcher called with each item (plus any extra `args`); items it returns `true` for are kept. |
| `args` | `A` | Extra arguments passed to `match` after each item. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | Iterable yielding only the items the matcher returned `true` for. |

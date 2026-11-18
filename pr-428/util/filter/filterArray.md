# filterArray()

- Kind: function
- Import: `import { filterArray } from "shelving/util/filter";`

Filter an array (immutably) using a matcher.
- Returns the exact same array instance if no items were removed (for referential stability).

## Signatures

```ts
filterArray(input: ImmutableArray<T>, match: Match<[T, ...A]>, ...args: A): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `ImmutableArray<T>` | Array of items to filter. |
| `match` | `Match<[T, ...A]>` | Matcher called with each item (plus any extra `args`); items it returns `true` for are kept. |
| `args` | `A` | Extra arguments passed to `match` after each item. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A filtered array, or the same `input` instance if nothing was removed. |

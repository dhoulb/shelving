# interleaveItems()

- Kind: function
- Import: `import { interleaveItems } from "shelving/util/iterate";`

Interleave items with a separator, i.e. `[item1, separator, item2, separator, item3]`

## Signatures

```ts
interleaveItems(items: Iterable<T>, separator: T): Iterable<T>
interleaveItems(items: Iterable<A>, separator: B): Iterable<A | B>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable to interleave. |
| `separator` | `T` | The value to insert between each pair of items. |
| `items` | `Iterable<A>` |  |
| `separator` | `B` |  |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | An iterable yielding the items with `separator` between them. |
| `Iterable<A \| B>` |  |

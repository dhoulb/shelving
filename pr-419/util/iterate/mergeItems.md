# mergeItems()

- Kind: function
- Import: `import { mergeItems } from "shelving/util/iterate";`

Merge two or more iterables into a single iterable set.
- Yields all items from each input in order.

## Signatures

```ts
mergeItems(...inputs: [Iterable<T>, Iterable<T>, ...Iterable<T>[]]): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `inputs` | `[Iterable<T>, Iterable<T>, ...Iterable<T>[]]` | Two or more iterables to merge. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | An iterable yielding every item from each input in sequence. |

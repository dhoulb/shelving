# interleaveArray()

- Kind: function
- Import: `import { interleaveArray } from "shelving/util/array";`

Interleave array items with a separator.

## Signatures

```ts
interleaveArray(items: PossibleArray<T>, separator: T): ImmutableArray<T>
interleaveArray(items: PossibleArray<A>, separator: B): ImmutableArray<A | B>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to interleave. |
| `separator` | `T` | The value to insert between each pair of items. |
| `items` | `PossibleArray<A>` |  |
| `separator` | `B` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | A new array with `separator` inserted between items, or the same array if it had fewer than two items. |
| `ImmutableArray<A \| B>` |  |

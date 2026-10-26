# reduceItems()

- Kind: function
- Import: `import { reduceItems } from "shelving/util/iterate";`

Reduce an iterable set of items using a reducer function.
- Calls `reducer` for each item, threading the accumulated value through.

## Signatures

```ts
reduceItems(items: Iterable<T>, reducer: (previous: T, item: T) => T, initial: T): T
reduceItems(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined
reduceItems(items: Iterable<I>, reducer: (previous: O, item: I) => O, initial: O): O
reduceItems(items: Iterable<I>, reducer: (previous: O | undefined, item: I) => O, initial?: O): O | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<T>` | The iterable to reduce. |
| `reducer` | `(previous: T, item: T) => T` | Reducer called with the previous accumulated value and the current item, returning the next accumulated value. |
| `initial` | `T` | The initial accumulated value. |
| `items` | `Iterable<T>` |  |
| `reducer` | `(previous: T \| undefined, item: T) => T` |  |
| `initial` | `T` | Optional. |
| `items` | `Iterable<I>` |  |
| `reducer` | `(previous: O, item: I) => O` |  |
| `initial` | `O` |  |
| `reducer` | `(previous: O \| undefined, item: I) => O` |  |
| `initial` | `O` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The final accumulated value, or `undefined` if the iterable is empty and no `initial` was given. |
| `T \| undefined` |  |
| `O` |  |
| `O \| undefined` |  |

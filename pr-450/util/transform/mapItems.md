# mapItems()

- Kind: function
- Import: `import { mapItems } from "shelving/util/transform";`

Lazily transform every item in an iterable.

## Signatures

```ts
mapItems(items: Iterable<I>, transform: (v: I, ...args: A) => O, ...args: A): Iterable<O>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Iterable<I>` | The source iterable of items. |
| `transform` | `(v: I, ...args: A) => O` | Function applied to each item to produce the output item. |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<O>` | An iterable yielding each transformed item. |

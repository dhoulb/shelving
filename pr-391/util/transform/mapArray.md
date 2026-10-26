# mapArray()

- Kind: function
- Import: `import { mapArray } from "shelving/util/transform";`

Transform every item of an iterable into a new array.

## Signatures

```ts
mapArray(arr: Iterable<I>, transform: (v: I, ...args: A) => O, ...args: A): ImmutableArray<O>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `Iterable<I>` | The source iterable of items. |
| `transform` | `(v: I, ...args: A) => O` | Function applied to each item to produce the output item. |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<O>` | A new array containing each transformed item. |

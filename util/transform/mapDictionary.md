# mapDictionary()

- Kind: function
- Import: `import { mapDictionary } from "shelving/util/transform";`

Transform the values of a dictionary into a new dictionary.
- Keys are preserved; each value is passed to `transform` to produce its new value.

## Signatures

```ts
mapDictionary(dictionary: ImmutableDictionary<I>, transform: (value: I, ...args: A) => O, ...args: A): ImmutableDictionary<O>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dictionary` | `ImmutableDictionary<I>` | The source dictionary. |
| `transform` | `(value: I, ...args: A) => O` | Function applied to each value to produce the output value. |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableDictionary<O>` | A new dictionary with the same keys and transformed values. |

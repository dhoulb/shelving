# mapEntries()

- Kind: function
- Import: `import { mapEntries } from "shelving/util/transform";`

Lazily transform the values of a set of entries, keeping each key.
- The whole `[key, value]` entry is passed to `transform`, which returns the new value.

## Signatures

```ts
mapEntries(entries: Iterable<Entry<K, I>>, transform: (entry: Entry<K, I>, ...args: A) => O, ...args: A): Iterable<Entry<K, O>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entries` | `Iterable<Entry<K, I>>` | The source iterable of `[key, value]` entries. |
| `transform` | `(entry: Entry<K, I>, ...args: A) => O` | Function applied to each entry to produce the output value. |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<Entry<K, O>>` | An iterable of `[key, transformedValue]` entries. |

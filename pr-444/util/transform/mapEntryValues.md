# mapEntryValues()

- Kind: function
- Import: `import { mapEntryValues } from "shelving/util/transform";`

Lazily transform the values of a set of entries, keeping each key.
- Only the value is passed to `transform`, which returns the new value.

## Signatures

```ts
mapEntryValues(entries: Iterable<Entry<K, I>>, transform: (value: I, ...args: A) => O, ...args: A): Iterable<Entry<K, O>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entries` | `Iterable<Entry<K, I>>` | The source iterable of `[key, value]` entries. |
| `transform` | `(value: I, ...args: A) => O` | Function applied to each value to produce the output value. |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<Entry<K, O>>` | An iterable of `[key, transformedValue]` entries. |

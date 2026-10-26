# getEntries()

- Kind: function
- Import: `import { getEntries } from "shelving/util/entry";`

Yield the entries from one or more entry-yielding sources (sets, objects, maps, arrays, or iterables of entries).

## Signatures

```ts
getEntries(...input: (ImmutableSet<K & T> | Partial<ImmutableObject<K, T>> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>
getEntries(...input: (ImmutableArray<T> | ImmutableSet<K & T> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>
getEntries(...input: (ImmutableSet<K & T> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `(ImmutableSet<K & T> \| Partial<ImmutableObject<K, T>> \| Iterable<Entry<K, T>>)[]` | One or more sources that can yield `[key, value]` entries. |
| `input` | `(ImmutableArray<T> \| ImmutableSet<K & T> \| Iterable<Entry<K, T>>)[]` |  |
| `input` | `(ImmutableSet<K & T> \| Iterable<Entry<K, T>>)[]` |  |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<Entry<K, T>>` | Iterable yielding the combined entries from every input. |
| `Iterable<Entry<K, T>>` |  |

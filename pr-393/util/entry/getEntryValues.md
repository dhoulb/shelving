# getEntryValues()

- Kind: function
- Import: `import { getEntryValues } from "shelving/util/entry";`

Yield the values of an iterable set of entries.

## Signatures

```ts
getEntryValues(input: Iterable<Entry<K, T>>): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `Iterable<Entry<K, T>>` | Iterable of `[key, value]` entries. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | Iterable yielding each entry's value. |

# getEntryKeys()

- Kind: function
- Import: `import { getEntryKeys } from "shelving/util/entry";`

Yield the keys of an iterable set of entries.

## Signatures

```ts
getEntryKeys(input: Iterable<Entry<K, T>>): Iterable<K>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `Iterable<Entry<K, T>>` | Iterable of `[key, value]` entries. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<K>` | Iterable yielding each entry's key. |

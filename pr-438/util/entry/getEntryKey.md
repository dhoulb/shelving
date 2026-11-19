# getEntryKey()

- Kind: function
- Import: `import { getEntryKey } from "shelving/util/entry";`

Extract the key from an object entry.

## Signatures

```ts
getEntryKey([k]: Entry<K, T>): K
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entry` | `Entry<K, T>` | The `[key, value]` entry to read from. |

## Returns

| Type | Description |
| --- | --- |
| `K` | The key (first element) of the entry. |

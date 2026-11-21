# getEntryValue()

- Kind: function
- Import: `import { getEntryValue } from "shelving/util/entry";`

Extract the value from an object entry.

## Signatures

```ts
getEntryValue([, v]: Entry<K, T>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entry` | `Entry<K, T>` | The `[key, value]` entry to read from. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value (second element) of the entry. |

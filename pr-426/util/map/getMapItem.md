# getMapItem()

- Kind: function
- Import: `import { getMapItem } from "shelving/util/map";`

Get an item in a map, or `undefined` if it doesn't exist.

## Signatures

```ts
getMapItem(map: ImmutableMap<K, T>, key: K): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `ImmutableMap<K, T>` | The map to read from. |
| `key` | `K` | The key to look up. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The value for `key`, or `undefined` if it doesn't exist. |

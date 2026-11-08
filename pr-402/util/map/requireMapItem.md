# requireMapItem()

- Kind: function
- Import: `import { requireMapItem } from "shelving/util/map";`

Get an item in a map, or throw `RequiredError` if it doesn't exist.

## Signatures

```ts
requireMapItem(map: ImmutableMap<K, T>, key: K, caller: AnyCaller = requireMapItem): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `ImmutableMap<K, T>` | The map to read from. |
| `key` | `K` | The key to look up. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `requireMapItem`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value for `key`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `key` does not exist in `map`. |

# requireDictionaryItem()

- Kind: function
- Import: `import { requireDictionaryItem } from "shelving/util/dictionary";`

Get an item in a dictionary object, or throw `RequiredError` if it doesn't exist.

## Signatures

```ts
requireDictionaryItem(dict: ImmutableDictionary<T>, key: string, caller: AnyCaller = requireDictionaryItem): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dict` | `ImmutableDictionary<T>` | The dictionary to read the item from. |
| `key` | `string` | The key of the item to read. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireDictionaryItem` itself). Defaults to `requireDictionaryItem`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value of the item. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `key` is not an own prop of `dict`. |

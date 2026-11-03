# getDictionaryItem()

- Kind: function
- Import: `import { getDictionaryItem } from "shelving/util/dictionary";`

Get an item in a dictionary object, or `undefined` if it doesn't exist.

## Signatures

```ts
getDictionaryItem(dict: ImmutableDictionary<T>, key: string): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dict` | `ImmutableDictionary<T>` | The dictionary to read the item from. |
| `key` | `string` | The key of the item to read. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The value of the item, or `undefined` if `key` is not an own prop of `dict`. |

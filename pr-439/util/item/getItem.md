# getItem()

- Kind: function
- Import: `import { getItem } from "shelving/util/item";`

Merge an ID into a set of data to make an `Item`.
- Returns the data unchanged if it already has the given `id`.

## Signatures

```ts
getItem(id: I, data: T | Item<I, T>): Item<I, T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `id` | `I` | The identifier to set on the data. |
| `data` | `T \| Item<I, T>` | The data or item object to attach the identifier to. |

## Returns

| Type | Description |
| --- | --- |
| `Item<I, T>` | An item object with the given `id`. |

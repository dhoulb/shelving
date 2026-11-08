# hasIdentifier()

- Kind: function
- Import: `import { hasIdentifier } from "shelving/util/item";`

Does a data object have a given identifier (and is therefore an `Item`).

## Signatures

```ts
hasIdentifier(item: T | Item<I, T>, id: I): item is Item<I, T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `item` | `T \| Item<I, T>` | The data or item object to test. |
| `id` | `I` | The identifier to match against the object's `id` property. |

## Returns

| Type | Description |
| --- | --- |
| `item is Item<I, T>` | `true` if `item.id` equals `id`, otherwise `false`. |

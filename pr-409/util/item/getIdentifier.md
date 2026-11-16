# getIdentifier()

- Kind: function
- Import: `import { getIdentifier } from "shelving/util/item";`

Get the identifier from an item object.

## Signatures

```ts
getIdentifier({ id }: Item<I, T>): I
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `item` | `Item<I, T>` | The item object to read the `id` from. |

## Returns

| Type | Description |
| --- | --- |
| `I` | The item's `id` identifier. |

# getIdentifiers()

- Kind: function
- Import: `import { getIdentifiers } from "shelving/util/item";`

Get the identifiers from an iterable set of item objects.

## Signatures

```ts
getIdentifiers(entities: Iterable<Item<I, T>>): Iterable<I>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `entities` | `Iterable<Item<I, T>>` | The iterable of item objects to read identifiers from. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<I>` | An iterable yielding the `id` of each item. |

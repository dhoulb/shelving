# QueryItems

- Kind: type
- Import: `import { QueryItems } from "shelving/util/query";`

A query and the items that answer it, e.g. one page of results from an API endpoint.

## Signatures

```ts
{
	readonly query: Query<Item<I, T>>;
	readonly items: Items<I, T>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `query` | `Query<Item<I, T>>` | Read only. |
| `items` | `Items<I, T>` | Read only. |

## Types

- [Query](Query.md): Query that can be applied to a list of data objects.
- [Item](../item/Item.md): An item object is a data object that includes an "id" identifier property that is either a string or number.
- [Items](../item/Items.md): An array of item objects.

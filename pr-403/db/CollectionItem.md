# CollectionItem

- Kind: type
- Import: `import { CollectionItem } from "shelving/db";`

Extract the `Item` type from a `Collection` instance.

## Signatures

```ts
Item<CollectionIdentifier<C>, CollectionData<C>>
```

## Types

- [Item](../util/item/Item.md): An item object is a data object that includes an "id" identifier property that is either a string or number.
- [CollectionIdentifier](CollectionIdentifier.md): Extract the Identifier type from a Collection instance.
- [CollectionData](CollectionData.md): Extract the Data type from a Collection instance.

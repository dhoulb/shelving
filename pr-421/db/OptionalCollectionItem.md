# OptionalCollectionItem

- Kind: type
- Import: `import { OptionalCollectionItem } from "shelving/db";`

Extract the optional (possibly undefined) `Item` type from a `Collection` instance.

## Signatures

```ts
OptionalItem<CollectionIdentifier<C>, CollectionData<C>>
```

## Types

- [OptionalItem](../util/item/OptionalItem.md): Item object, or undefined to indicate the item doesn't exist.
- [CollectionIdentifier](CollectionIdentifier.md): Extract the Identifier type from a Collection instance.
- [CollectionData](CollectionData.md): Extract the Data type from a Collection instance.

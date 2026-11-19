# PersonItem

- Kind: type
- Import: `import { PersonItem } from "shelving/test";`

A test person as a stored `Item` — `PersonData` plus a string `id`.

## Signatures

```ts
Item<string, PersonData>
```

## Types

- [Item](../util/item/Item.md): An item object is a data object that includes an "id" identifier property that is either a string or number.
- [PersonData](PersonData.md): Validated data shape of a test person, inferred from PERSON_SCHEMA.

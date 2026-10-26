# CollectionsDatabase

- Kind: type
- Import: `import { CollectionsDatabase } from "shelving/db";`

Convert a `Collections` array type to a database-style object mapping in `{ name: data }` format.

## Signatures

```ts
{
	[E in C[number] as E extends Collection<infer N, Identifier, Data> ? N : never]: E extends Collection<string, Identifier, infer T>
		? T
		: never;
}
```

## Types

- `E`
- [Collection](Collection.md): Declarative definition of a database collection/table.
- [Identifier](../util/item/Identifier.md): Allowed types for the "id" property (identifier) for an item.
- [Data](../util/data/Data.md): Data object — a plain object with string keys and unknown values.
- `N`
- `T`

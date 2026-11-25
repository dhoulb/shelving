# SQLMigrator.getCreateTableQuery()

- Kind: method
- Member of: `SQLMigrator`

Build the `CREATE TABLE` statement for a collection, with its `id` column and one column for each top-level prop.

## Signatures

```ts
getCreateTableQuery(collection: Collection<string, Identifier, T>): string
```

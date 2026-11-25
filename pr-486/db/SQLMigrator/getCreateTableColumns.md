# SQLMigrator.getCreateTableColumns()

- Kind: method
- Member of: `SQLMigrator`

Get the full set of columns for a collection's table: the `id` column, then one column for each top-level prop.

## Signatures

```ts
getCreateTableColumns(collection: Collection<string, Identifier, T>): readonly SQLTableColumn[]
```

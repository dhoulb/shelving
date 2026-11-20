# SQLMigrator.getCreateTableColumns()

- Kind: method
- Member of: `SQLMigrator`

Get the full set of columns for a collection's table: the ID column, data column, and generated columns.

## Signatures

```ts
getCreateTableColumns(collection: Collection<string, number, T>): readonly SQLTableColumn[]
```

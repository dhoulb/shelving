# PostgresMigrator

- Kind: class
- Import: `import { PostgresMigrator } from "shelving/db";`
- Extends: `SQLMigrator<T>`

PostgreSQL migrator that inspects the live schema via `pg_catalog` tables to diff and migrate columns.

## Signatures

```ts
new PostgresMigrator<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `PostgresMigrator<T>` |  |

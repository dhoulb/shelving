# PostgresMigrator

- Kind: class
- Import: `import { PostgresMigrator } from "shelving/db";`
- Extends: `SQLMigrator<T>`

PostgreSQL migrator that inspects the live schema via `pg_catalog` tables to diff and migrate columns.

- Types match what Bun's PostgreSQL client reads back: `text`, `integer`, `double precision`, `boolean`, and `jsonb` for JSON props.
- Dates are `text`, because the client reads a `date` column as a `Date` object, not the string that `DateSchema` makes.

## Signatures

```ts
new PostgresMigrator<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `PostgresMigrator<T>` |  |

# SQLiteMigrator

- Kind: class
- Import: `import { SQLiteMigrator } from "shelving/db";`
- Extends: `SQLMigrator<T>`

SQLite (and Cloudflare D1) migrator that uses `sqlite_master` as the schema source of truth.

- Tables use `STRICT` mode. Booleans are `INTEGER`, and JSON props are `TEXT` with a `json_valid()` check.

## Signatures

```ts
new SQLiteMigrator<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `SQLiteMigrator<T>` |  |

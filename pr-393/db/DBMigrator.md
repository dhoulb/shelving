# DBMigrator

- Kind: class
- Import: `import { DBMigrator } from "shelving/db";`

Base class for database schema migrators that bring a provider's storage into line with a set of collection schemas.

- Subclasses implement `migrate()` for a specific backend (e.g. SQL via `SQLMigrator`).

## Signatures

```ts
new DBMigrator<T>(provider: T)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `provider` | `T` |  |

## Returns

| Type | Description |
| --- | --- |
| `DBMigrator<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `provider` | `T` | The database provider whose storage this migrator updates. Read only. |

## Methods

- [DBMigrator.migrate()](DBMigrator/migrate.md): Bring the provider's storage into line with the given collection schemas.

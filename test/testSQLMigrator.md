# testSQLMigrator()

- Kind: function
- Import: `import { testSQLMigrator } from "shelving/test";`

Register the `SQLMigrator` contract test suite against a migrator and its real database.

- Call it after the migrator made the `BASICS_COLLECTION` and `PEOPLE_COLLECTION` tables, so the first test can check that they need no changes.
- The other tests drop and make a `migrated` table, then change it with three versions of a collection, and check that the provider can still read and write it.

## Signatures

```ts
testSQLMigrator(name: string, createMigrator: () => SQLMigrator<SQLProvider<string>> | PromiseLike<SQLMigrator<SQLProvider<string>>>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name for the migrator, used in the `describe` block. |
| `createMigrator` | `() => SQLMigrator<SQLProvider<string>> \| PromiseLike<SQLMigrator<SQLProvider<string>>>` | Create (or return) the migrator to test. |

## Examples

```ts
testSQLMigrator("SQLiteMigrator", () => new SQLiteMigrator(provider));
```

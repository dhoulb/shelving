# SQLMigrator.migrate()

- Kind: method
- Member of: `SQLMigrator`

Run each statement from `getMigrations()` against the provider in order.

## Signatures

```ts
migrate(...collections: Collections<number>): Promise<void>
```

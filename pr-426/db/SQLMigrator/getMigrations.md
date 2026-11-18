# SQLMigrator.getMigrations()

- Kind: method
- Member of: `SQLMigrator`

Compute the SQL statements needed to bring the tables into line with the given collection schemas, without executing them.

## Signatures

```ts
getMigrations(...collections: Collections<number>): Promise<readonly string[]>
```

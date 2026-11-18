# SQLProvider.sqlExtract()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment that extracts a value at a key for comparison, e.g. `"a" #>> {"b","c"}` in Postgres.
- Base implementation only supports flat (single-segment) keys; subclasses override for nested JSON paths.

## Signatures

```ts
sqlExtract(key: Segments): SQLFragment
```

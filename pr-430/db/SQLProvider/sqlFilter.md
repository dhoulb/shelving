# SQLProvider.sqlFilter()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for a single filter clause on a column, e.g. `x = 1` or `x IN (1, 2)`.

## Signatures

```ts
sqlFilter({ key, operator, value }: QueryFilter): SQLFragment
```

# SQLProvider.sqlConcat()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment that joins a series of fragments with a separator, e.g. `"a" = 1 AND "b" = 2`.

## Signatures

```ts
sqlConcat(values: ImmutableArray<SQLFragment>, separator = ", ", before = "", after = ""): SQLFragment
```

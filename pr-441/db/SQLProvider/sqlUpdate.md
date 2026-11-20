# SQLProvider.sqlUpdate()

- Kind: method
- Member of: `SQLProvider`

Define an SQL fragment for a single update action.
- Handles flat `set` and `sum` only (single-segment key).
- Nested keys (multi-segment) and `with`/`omit` actions throw `UnsupportedError`.
- Subclasses should override to support nested keys and array mutation actions.

## Signatures

```ts
sqlUpdate({ action, key, value }: Update): SQLFragment
```

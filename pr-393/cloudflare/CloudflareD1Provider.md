# CloudflareD1Provider

- Kind: class
- Import: `import { CloudflareD1Provider } from "shelving/cloudflare";`
- Extends: `SQLiteProvider<I, T>`

SQLite database provider backed by Cloudflare D1.

Implements the `SQLiteProvider` SQL abstraction by binding tagged-template queries and running them through the D1 Worker API.
- Tagged-template values are flattened into positional `?` bindings; nested `SQLFragment` values are inlined recursively.
- Array and plain-object values are JSON-encoded before binding; other non-primitive values throw `ValueError`.
- The `D1Database` binding is provided by the Cloudflare Workers runtime environment.

## Signatures

```ts
new CloudflareD1Provider<I, T>(db: D1Database)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `db` | `D1Database` |  |

## Returns

| Type | Description |
| --- | --- |
| `CloudflareD1Provider<I, T>` |  |

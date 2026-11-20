# CloudflareKVProvider

- Kind: class
- Import: `import { CloudflareKVProvider } from "shelving/cloudflare";`
- Extends: `DBProvider<I, T>`

Cloudflare Workers KV database provider.

Items are stored as JSON values under keys formatted as `collection:id`.
The `KVNamespace` object is provided by the Cloudflare Workers runtime environment.

### Supported
- Single item operations: `getItem`, `setItem`, `addItem`, `updateItem`, `deleteItem`.
- ID generation: `addItem()` generates a UUID v4 identifier automatically.

### Not supported
- **Realtime subscriptions:** `getItemSequence()` and `getQuerySequence()` throw `UnsupportedError`.
  KV has no change feed or push notification mechanism.
- **Updates:** `updateItem()` and `updateQuery()` throw `UnsupportedError`.
- **Collection queries:** `getQuery()`, `setQuery()`, `deleteQuery()`, and `countQuery()` are not supported.
  KV does not expose efficient filtering, sorting, or collection scans, so this provider avoids the old "read everything and filter in memory" behavior.

### Performance limitations
- **Single-key store only:** This provider is intentionally limited to direct key reads and writes.
  If you need collection queries, filtering, sorting, or bulk mutations, use a different backend.
- **Eventual consistency:** KV is eventually consistent, so reads may briefly return stale values shortly after writes.

## Signatures

```ts
new CloudflareKVProvider<I, T>(kv: KVNamespace)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `kv` | `KVNamespace` |  |

## Returns

| Type | Description |
| --- | --- |
| `CloudflareKVProvider<I, T>` |  |

# DBProvider

The abstract base class every database backend implements. `DBProvider<I, T>` defines the typed surface that all call sites use — item reads and writes, queries, and realtime sequences — generic over a `Collection` so the compiler tracks `id` and `data` types automatically.

Concrete backends implement the abstract methods; the base class derives `requireItem`, `countQuery`, `getFirst`, and `requireFirst` from them. `DBProvider` implements `AsyncDisposable`.

## Usage

Type code that accepts "any database" against `DBProvider` so an in-memory store, a validated chain, or a SQL backend are all interchangeable:

```ts
import type { DBProvider } from "shelving/db"

async function publishPost(provider: DBProvider, id: string) {
  await provider.updateItem(POSTS, id, { published: true });
}
```

The method surface covers single items (`getItem`, `requireItem`, `addItem`, `setItem`, `updateItem`, `deleteItem`), queries (`getQuery`, `countQuery`, `setQuery`, `updateQuery`, `deleteQuery`, `getFirst`, `requireFirst`), realtime (`getItemSequence`, `getQuerySequence` — iterate with `for await...of`), and transactions (`transact`).

Query writes (`setQuery`, `updateQuery`, `deleteQuery`) have a deliberately weak portable contract: `DBProvider` itself implements them "two-step" — resolve the matching items with `getQuery()`, then write each one concurrently through the item methods — and engines override them with a native single call where one exists (SQL's `UPDATE … WHERE`). Either way they are only guaranteed atomic inside `transact()`.

The derived reads (`requireItem`, `getFirst`, `requireFirst`) and the default `countQuery` are sugar built on `getItem()` / `getQuery()`, so a provider only ever has to implement the core operations — and behaviour added by a wrapping provider (see `ThroughDBProvider`) automatically applies to them too.

## Transactions

`transact()` runs a callback as a single atomic transaction — every write made through the provider the callback receives is committed together, or not at all:

```ts
await provider.transact(async db => {
  const from = await db.requireItem(ACCOUNTS, "alice");
  const to = await db.requireItem(ACCOUNTS, "bob");
  await db.updateItem(ACCOUNTS, "alice", { balance: from.balance - 100 });
  await db.updateItem(ACCOUNTS, "bob", { balance: to.balance + 100 });
});
```

The contract is the weakest guarantee shared by all backends, so transactional code stays portable:

- Reads see a consistent snapshot of the data from before the transaction, and do **not** see the transaction's own uncommitted writes.
- If the callback throws, nothing is committed and the error is rethrown.
- The callback may run more than once if the backend retries on contention, so it must have no side effects other than through its provider.
- Portable code must not use realtime sequences or nested `transact()` calls inside a transaction — most backends throw `UnsupportedError`, though some (e.g. `MemoryDBProvider`) support them scoped to the transaction.
- Providers that cannot support transactions (e.g. `CloudflareKVProvider`) throw `UnsupportedError` from `transact()` itself.

Transactions are opt-in per backend — `FirestoreProvider` (`shelving/firebase`) implements them, `BunPostgresProvider` (`shelving/bun`) runs the callback in a `SERIALIZABLE` Postgres transaction (retrying contention aborts automatically), and `MemoryDBProvider` runs the callback against a snapshot clone and replays its recorded writes on success. Wrapping providers built on `ThroughDBProvider` (`ValidationDBProvider`, `RecordingDBProvider`, `DebugDBProvider`) support them whenever their `source` does, and keep their own behaviour inside the transaction — e.g. reads and writes in a `ValidationDBProvider` transaction are still validated. `CacheDBProvider` does not support transactions yet and throws `UnsupportedError`.

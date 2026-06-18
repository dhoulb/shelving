# DBProvider

The abstract base class every database backend implements. `DBProvider<I, T>` defines the typed surface that all call sites use — item reads and writes, queries, and realtime sequences — generic over a [`Collection`](/db/Collection) so the compiler tracks `id` and `data` types automatically.

Concrete backends implement the abstract methods; the base class derives `requireItem`, `countQuery`, `getFirst`, and `requireFirst` from them. `DBProvider` implements `AsyncDisposable`.

## Usage

Type code that accepts "any database" against `DBProvider` so an in-memory store, a validated chain, or a SQL backend are all interchangeable:

```ts
import type { DBProvider } from "shelving/db"

async function publishPost(provider: DBProvider, id: string) {
  await provider.updateItem(POSTS, id, { published: true });
}
```

The method surface covers single items (`getItem`, `requireItem`, `addItem`, `setItem`, `updateItem`, `deleteItem`), queries (`getQuery`, `countQuery`, `setQuery`, `updateQuery`, `deleteQuery`, `getFirst`, `requireFirst`), and realtime (`getItemSequence`, `getQuerySequence` — iterate with `for await...of`).

# firebase

`FirestoreProvider` — a Cloud Firestore `DBProvider` that talks directly to the [Firestore REST API](https://docs.cloud.google.com/firestore/docs/reference/rest) using `fetch`.

- **Zero dependencies.** No `firebase` or `@google-cloud/firestore` SDK, no gRPC — it runs anywhere `fetch` runs: Node.js, Bun, Cloudflare Workers, Deno, and other edge runtimes.
- **Transactions.** `DBProvider.transact()` is fully supported: reads (including queries and counts) see one consistent snapshot, writes buffer and commit atomically, and contended commits retry automatically.
- **No realtime.** `DBProvider.getItemSequence()` and `DBProvider.getQuerySequence()` throw `UnsupportedError` — the `:listen` endpoint needs a streaming session the plain REST API can't provide.

## Usage

```ts
import { FirestoreProvider } from "shelving/firebase";

const provider = new FirestoreProvider({
  project: "my-project",
  token: () => auth.getAccessToken(), // e.g. from `google-auth-library`
});

const id = await provider.addItem(POSTS, { title: "Hello", body: "First post.", published: false });

await provider.transact(async db => {
  const post = await db.requireItem(POSTS, id);
  await db.updateItem(POSTS, id, { published: true, "+=views": 1 });
});
```

### Options

- `project` — Google Cloud project id (required).
- `database` — Firestore database id (defaults to `"(default)"`).
- `token` — callback returning an OAuth2 access token for each request. Use `google-auth-library`, or any code that can mint a token for the `https://www.googleapis.com/auth/datastore` scope. Omit for the emulator.
- `host` — base URL of the Firestore API (defaults to `https://firestore.googleapis.com`). Point it at the emulator in tests.
- `fetch` — custom fetch implementation (defaults to the global `fetch`).

### With the Firestore emulator

```ts
const provider = new FirestoreProvider({
  project: "demo-project",
  host: `http://${process.env.FIRESTORE_EMULATOR_HOST}`,
});
```

## Behaviour notes

- **Ids**: `DBProvider.addItem()` generates a random 20-character id client-side and commits with an `exists: false` precondition, so it fails rather than overwriting on the (vanishingly unlikely) collision.
- **Updates**: `DBProvider.updateItem()` uses an update mask plus field transforms — `+=` maps to `increment`, `+[]` to `appendMissingElements`, `-[]` to `removeAllFromArray` — and fails if the item does not exist.
- **Query writes**: `setQuery()` / `updateQuery()` / `deleteQuery()` read the matching document names (a `__name__`-only query) then commit writes in batches of 500.
- **Values**: safe integers store as Firestore integers, other finite numbers as doubles; integers beyond `Number.MAX_SAFE_INTEGER` lose precision when read back. Foreign types written by other clients (timestamps, references, bytes) read back as their string form. Data read from Firestore is unvalidated — wrap the provider in `ValidationDBProvider` to guarantee types.
- **Transactions**: retried up to 5 times on contention (`ABORTED`), so `transact()` callbacks must have no side effects other than through their provider. Firestore limits a transaction to 270 seconds with a 60-second idle timeout.

## Testing

Unit tests (value codec and request protocol) run offline in the normal test suite. The universal `DBProvider` contract suite runs against the real Firestore emulator:

```sh
bun run test-firebase
```

This wraps `bun test ./modules/firebase` in `firebase emulators:exec`, which starts the emulator (requires Java), sets `FIRESTORE_EMULATOR_HOST`, and shuts it down afterwards. Without that env var the emulator-backed tests don't register, so the offline suite stays green.

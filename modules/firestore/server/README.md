# Firestore server SDK

`FirestoreServerProvider` for the Firebase Admin SDK (`@google-cloud/firestore`). Use this in Node.js backends, Cloud Functions, or any server environment that authenticates via a service account or Application Default Credentials.

## When to use this

Choose `shelving/firestore/server` for server-side code. It uses the `@google-cloud/firestore` package directly (the same driver the Admin SDK uses) rather than the browser-oriented Firebase JS SDK. It supports realtime subscriptions and uses `BulkWriter` for efficient bulk mutations.

## Install

```sh
npm install firebase-admin shelving
```

## Setup

### With explicit credentials

```ts
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { FirestoreServerProvider } from "shelving/firestore/server";

initializeApp({
  credential: cert({
    projectId: "...",
    clientEmail: "...",
    privateKey: "...",
  }),
});

const db = getFirestore();
const provider = new FirestoreServerProvider(db);
```

### With Application Default Credentials

When running on Google Cloud infrastructure (Cloud Run, Cloud Functions, GKE, etc.) you can omit the constructor argument entirely. The provider constructs a `Firestore` instance using ADC:

```ts
import { FirestoreServerProvider } from "shelving/firestore/server";

const provider = new FirestoreServerProvider();
```

## Realtime subscriptions

`DBProvider.getItemSequence()` and `DBProvider.getQuerySequence()` use `onSnapshot` from the Admin SDK and return `AsyncIterable` backed by a live Firestore listener.

## Bulk query mutations

`DBProvider.setQuery()`, `DBProvider.updateQuery()`, and `DBProvider.deleteQuery()` use `BulkWriter` for efficient batched writes. Documents are fetched in pages of 1000 using `select()` (a field-mask query with no fields) to minimise data transfer, and writes are flushed as each page is processed.

## Transactions

`DBProvider.transact()` runs its callback through `Firestore.runTransaction()`, which commits on success, rolls back on error, and automatically retries the callback on contention (so the callback must have no side effects other than through its provider).

```ts
await provider.transact(async db => {
  const account = await db.requireItem(ACCOUNTS, "alice");
  await db.updateItem(ACCOUNTS, "alice", { balance: account.balance - 100 });
});
```

- Writes are buffered while the callback runs and applied when it resolves, so reads and writes can be freely interleaved (the Admin SDK's usual reads-before-writes rule does not leak through). Reads never see the transaction's own uncommitted writes.
- Queries and counts inside a transaction read through the transaction, so the whole callback sees one consistent snapshot.
- Query writes (`setQuery()` etc.) read every matching document ref inside the transaction rather than batching through `BulkWriter` — keep matching sets small.
- Realtime sequences and nested `transact()` calls throw `UnsupportedError` inside a transaction.
- Firestore limits a transaction to 270 seconds, with a 60-second idle timeout.

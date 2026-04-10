# firestore

[DBProvider](../db/README.md) implementations for Google Firestore. Three variants are available, each targeting a different SDK and runtime context. Choose the one that matches where your code runs.

| Provider | SDK | Realtime | Bundle size |
|---|---|---|---|
| `FirestoreClientProvider` | `firebase/firestore` | Yes | Full |
| `FirestoreLiteProvider` | `firebase/firestore/lite` | No | Smaller |
| `FirestoreServerProvider` | `@google-cloud/firestore` | Yes | Server only |

All three support filtering, sorting, pagination, partial updates, and `countQuery()`. The difference is in realtime support, SDK size, and where the code runs.

## Client SDK (`FirestoreClientProvider`)

Use in the browser or in any environment where the full Firebase JS SDK is appropriate. Supports offline persistence and realtime subscriptions via `getItemSequence()` and `getQuerySequence()`.

**Install:**

```sh
npm install firebase shelving
```

**Usage:**

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { FirestoreClientProvider } from "shelving/firestore/client";

const app = initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
});

const db = getFirestore(app);
const provider = new FirestoreClientProvider(db);
```

## Lite SDK (`FirestoreLiteProvider`)

A lighter alternative to the full client SDK, suitable for browser or server environments where realtime updates are not needed. Produces a smaller bundle and avoids the overhead of persistent connections.

`getItemSequence()` and `getQuerySequence()` throw `UnimplementedError`.

**Install:**

```sh
npm install firebase shelving
```

**Usage:**

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { FirestoreLiteProvider } from "shelving/firestore/lite";

const app = initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
});

const db = getFirestore(app);
const provider = new FirestoreLiteProvider(db);
```

## Server SDK (`FirestoreServerProvider`)

Use in Node.js backend environments with the Firebase Admin SDK. Authenticates via a service account rather than a user credential. Supports realtime subscriptions and uses `BulkWriter` for efficient bulk mutations.

**Install:**

```sh
npm install firebase-admin shelving
```

**Usage:**

```ts
import { initializeApp, cert } from "firebase-admin/app";
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

If you call `new FirestoreServerProvider()` with no argument it constructs a `Firestore` instance using Application Default Credentials, which works when running on Google Cloud infrastructure.

# Firestore lite SDK

`FirestoreLiteProvider` for the Firebase Lite SDK (`firebase/firestore/lite`). Use this when you want Firestore in the browser or on the server but do not need realtime subscriptions and prefer a smaller bundle.

## When to use this

Choose `firestore/lite` when realtime updates are not required. The Lite SDK omits the persistent connection, offline cache, and `onSnapshot` infrastructure, resulting in a meaningfully smaller bundle than the full client SDK. If you need realtime, use [firestore/client](/firestore/client). For server-side Node.js, use [firestore/server](/firestore/server).

## Install

```sh
npm install firebase shelving
```

## Setup

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

Note the import path: `firebase/firestore/lite`, not `firebase/firestore`.

## Limitations

- **No realtime.** `getItemSequence()` and `getQuerySequence()` throw `UnimplementedError`.
- **No offline persistence.** The Lite SDK does not cache documents locally.

All other operations — `getItem`, `addItem`, `setItem`, `updateItem`, `deleteItem`, `getQuery`, `setQuery`, `updateQuery`, `deleteQuery`, and `countQuery` — work the same as the full client provider.

## See also

- [firestore](/firestore) — provider comparison and parent module overview
- [firestore/client](/firestore/client) — full SDK with realtime and offline support
- [firestore/server](/firestore/server) — server-side provider with BulkWriter
- [db](/db) — `DBProvider` base class, `Collection`, and query syntax

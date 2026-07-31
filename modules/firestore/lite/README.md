# Firestore lite SDK

`FirestoreLiteProvider` for the Firebase Lite SDK (`firebase/firestore/lite`). Use this when you want Firestore in the browser or on the server but do not need realtime subscriptions and prefer a smaller bundle.

## When to use this

Choose `shelving/firestore/lite` when realtime updates are not required. The Lite SDK omits the persistent connection, offline cache, and `onSnapshot` infrastructure, resulting in a meaningfully smaller bundle than the full client SDK. If you need realtime, use `shelving/firestore/client`. For server-side Node.js, use `shelving/firestore/server`.

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

- **No realtime.** `DBProvider.getItemSequence()` and `DBProvider.getQuerySequence()` throw `UnsupportedError`.
- **No offline persistence.** The Lite SDK does not cache documents locally.

All other operations — `DBProvider.getItem()`, `DBProvider.addItem()`, `DBProvider.setItem()`, `DBProvider.updateItem()`, `DBProvider.deleteItem()`, `DBProvider.getQuery()`, `DBProvider.setQuery()`, `DBProvider.updateQuery()`, `DBProvider.deleteQuery()`, and `DBProvider.countQuery()` — work the same as the full client provider.

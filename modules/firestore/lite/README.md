# Firestore lite SDK

[`FirestoreLiteProvider`](/firestore/lite/FirestoreLiteProvider) for the Firebase Lite SDK (`firebase/firestore/lite`). Use this when you want Firestore in the browser or on the server but do not need realtime subscriptions and prefer a smaller bundle.

## When to use this

Choose [`shelving/firestore/lite`](/firestore/lite) when realtime updates are not required. The Lite SDK omits the persistent connection, offline cache, and `onSnapshot` infrastructure, resulting in a meaningfully smaller bundle than the full client SDK. If you need realtime, use [`shelving/firestore/client`](/firestore/client). For server-side Node.js, use [`shelving/firestore/server`](/firestore/server).

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

- **No realtime.** [`.getItemSequence()`](/db/DBProvider/getItemSequence) and [`.getQuerySequence()`](/db/DBProvider/getQuerySequence) throw [`UnimplementedError`](/error/UnimplementedError).
- **No offline persistence.** The Lite SDK does not cache documents locally.

All other operations — [`.getItem()`](/db/DBProvider/getItem), [`.addItem()`](/db/DBProvider/addItem), [`.setItem()`](/db/DBProvider/setItem), [`.updateItem()`](/db/DBProvider/updateItem), [`.deleteItem()`](/db/DBProvider/deleteItem), [`.getQuery()`](/db/DBProvider/getQuery), [`.setQuery()`](/db/DBProvider/setQuery), [`.updateQuery()`](/db/DBProvider/updateQuery), [`.deleteQuery()`](/db/DBProvider/deleteQuery), and [`.countQuery()`](/db/DBProvider/countQuery) — work the same as the full client provider.

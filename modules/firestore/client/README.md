# Firestore client SDK

[`FirestoreClientProvider`](/firestore/client/FirestoreClientProvider) for the full Firebase JS SDK (`firebase/firestore`). Use this in browser apps or any environment where you need offline persistence or realtime subscriptions.

## When to use this

Choose [`shelving/firestore/client`](/firestore/client) when your code runs in the browser and you want to receive live updates as documents change. If you do not need realtime and want a smaller bundle, use [`shelving/firestore/lite`](/firestore/lite) instead. For server-side Node.js code, use [`shelving/firestore/server`](/firestore/server).

## Install

```sh
npm install firebase shelving
```

## Setup

Initialize a Firebase app, get a `Firestore` instance, and pass it to the provider:

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

The provider takes a single `Firestore` argument. It delegates all app initialization and authentication to the Firebase SDK — configure those through the Firebase SDK directly.

## Realtime subscriptions

[`.getItemSequence()`](/db/DBProvider/getItemSequence) and [`.getQuerySequence()`](/db/DBProvider/getQuerySequence) return `AsyncIterable` backed by Firestore's `onSnapshot` listener. Each new value from Firestore resolves the next iteration:

```ts
for await (const post of provider.getItemSequence(POSTS, id)) {
  console.log(post); // emits whenever the document changes
}
```

The subscription opens lazily on first `for await` iteration and closes when the iterator is garbage-collected or the loop exits.

## Bulk query mutations

[`.setQuery()`](/db/DBProvider/setQuery), [`.updateQuery()`](/db/DBProvider/updateQuery), and [`.deleteQuery()`](/db/DBProvider/deleteQuery) fetch matching documents with `getDocs` and then issue parallel `Promise.all` writes. For large result sets, prefer [`shelving/firestore/server`](/firestore/server) which uses `BulkWriter`.

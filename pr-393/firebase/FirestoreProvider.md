# FirestoreProvider

- Kind: class
- Import: `import { FirestoreProvider } from "shelving/firebase";`
- Extends: `DBProvider<I, T>`

Cloud Firestore database provider that talks to the Firestore REST API using `fetch`, implementing the `DBProvider` abstraction.

- Zero dependencies, so it runs anywhere `fetch` runs: Node.js, Bun, Cloudflare Workers, Deno, and other edge runtimes.
- Supports transactions via `transact()` — reads see a consistent snapshot, writes buffer and commit atomically, and contended commits retry.
- Does not support realtime subscriptions: `getItemSequence()` and `getQuerySequence()` throw `UnsupportedError` (the `:listen` endpoint requires a streaming session the plain REST API cannot provide).
- Data read from Firestore is unvalidated — wrap in `ValidationDBProvider` to guarantee types.

## Signatures

```ts
new FirestoreProvider<I, T>(options: FirestoreProviderOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `FirestoreProviderOptions` |  |
| `.project` | `string` | Google Cloud project id. Read only. |
| `.database` | `string \| undefined` | Firestore database id. Read only. Defaults to `"(default)"`. |
| `.host` | `string \| undefined` | Base URL of the Firestore API, e.g. `"http://127.0.0.1:8080"` for the Firestore emulator. Read only. Defaults to `"https://firestore.googleapis.com"`. |
| `.token` | `(() => string \| PromiseLike<string>) \| undefined` | Return an OAuth2 access token for each request, e.g. from `google-auth-library` or a hand-rolled service-account JWT exchange. - Omit to send no `Authorization` header (correct for the Firestore emulator). Read only. Optional. |
| `.fetch` | `((input: string, init: RequestInit) => Promise<Response>) \| undefined` | Fetch implementation to use for requests (defaults to the global `fetch`). Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `FirestoreProvider<I, T>` |  |

## Examples

```ts
const provider = new FirestoreProvider({ project: "my-project", token: () => auth.getAccessToken() });
 const id = await provider.addItem(users, { name: "Dave" });
```

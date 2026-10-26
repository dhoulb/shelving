# FirestoreProviderOptions

- Kind: interface
- Import: `import { FirestoreProviderOptions } from "shelving/firebase";`

Options for `FirestoreProvider`.

## Signatures

```ts
{
	readonly project: string;
	readonly database?: string | undefined;
	readonly host?: string | undefined;
	readonly token?: (() => string | PromiseLike<string>) | undefined;
	readonly fetch?: ((input: string, init: RequestInit) => Promise<Response>) | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `project` | `string` | Google Cloud project id. Read only. |
| `database` | `string \| undefined` | Firestore database id. Read only. Defaults to `"(default)"`. |
| `host` | `string \| undefined` | Base URL of the Firestore API, e.g. `"http://127.0.0.1:8080"` for the Firestore emulator. Read only. Defaults to `"https://firestore.googleapis.com"`. |
| `token` | `(() => string \| PromiseLike<string>) \| undefined` | Return an OAuth2 access token for each request, e.g. from `google-auth-library` or a hand-rolled service-account JWT exchange. - Omit to send no `Authorization` header (correct for the Firestore emulator). Read only. Optional. |
| `fetch` | `((input: string, init: RequestInit) => Promise<Response>) \| undefined` | Fetch implementation to use for requests (defaults to the global `fetch`). Read only. Optional. |

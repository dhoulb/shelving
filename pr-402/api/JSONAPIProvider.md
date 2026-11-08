# JSONAPIProvider

- Kind: class
- Import: `import { JSONAPIProvider } from "shelving/api";`
- Extends: `ClientAPIProvider<P, R>`

Client API provider that always sends request bodies as JSON and parses responses as JSON.
- Forces JSON encoding regardless of the `Content-Type` the server returns.

A `ClientAPIProvider` that forces JSON. It sends request bodies as JSON and always parses responses as JSON, regardless of content-type headers — useful against APIs that are inconsistent about declaring `application/json`.

Because it extends `ClientAPIProvider`, it is a concrete network provider: construct it with the same `{ url, options?, timeout? }` options.

## Usage

```ts
import { JSONAPIProvider, ValidationAPIProvider } from "shelving/api"

const provider = new ValidationAPIProvider(
  new JSONAPIProvider({ url: "https://api.example.com" })
)

const user = await provider.call(getUser, { id: "u_123" })
```


## Signatures

```ts
new JSONAPIProvider<P, R>()
```

## Returns

| Type | Description |
| --- | --- |
| `JSONAPIProvider<P, R>` |  |

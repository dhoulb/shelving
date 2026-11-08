# XMLAPIProvider

- Kind: class
- Import: `import { XMLAPIProvider } from "shelving/api";`
- Extends: `ClientAPIProvider<P, R>`

Client API provider that always sends request bodies as XML and parses responses as plain text.
- Request payloads must be data objects (serialised to XML); results are returned as raw text strings.

A `ClientAPIProvider` for XML APIs. It sends request bodies as XML and returns the raw text of the response rather than parsing it as JSON.

Because it extends `ClientAPIProvider`, it is a concrete network provider: construct it with the same `{ url, options?, timeout? }` options.

## Usage

```ts
import { XMLAPIProvider } from "shelving/api"

const provider = new XMLAPIProvider({ url: "https://legacy.example.com" })

// The result is the raw response text.
const xml = await provider.call(getFeed, { channel: "news" })
```


## Signatures

```ts
new XMLAPIProvider<P, R>()
```

## Returns

| Type | Description |
| --- | --- |
| `XMLAPIProvider<P, R>` |  |

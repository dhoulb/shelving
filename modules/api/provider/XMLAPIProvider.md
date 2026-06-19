# XMLAPIProvider

A `ClientAPIProvider` for XML APIs. It sends request bodies as XML and returns the raw text of the response rather than parsing it as JSON.

Because it extends `ClientAPIProvider`, it is a concrete network provider: construct it with the same `{ url, options?, timeout? }` options.

## Usage

```ts
import { XMLAPIProvider } from "shelving/api"

const provider = new XMLAPIProvider({ url: "https://legacy.example.com" })

// The result is the raw response text.
const xml = await provider.call(getFeed, { channel: "news" })
```

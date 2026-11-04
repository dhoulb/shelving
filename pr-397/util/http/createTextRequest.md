# createTextRequest()

- Kind: function
- Import: `import { createTextRequest } from "shelving/util/http";`

Create a plain-text `Request`.

- `HEAD` and `GET` requests never send a body.

## Signatures

```ts
createTextRequest(method: RequestMethod, url: PossibleURL, body: string, options: RequestOptions = {}, caller: AnyCaller = createTextRequest): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestMethod` | The HTTP method. |
| `url` | `PossibleURL` | The target URL. |
| `body` | `string` | The plain-text request body. |
| `options` | `RequestOptions` | Additional request options. Defaults to `{}`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `createTextRequest`). Defaults to `createTextRequest`. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | A `Request` with `text/plain` content type. |

## Examples

```ts
createTextRequest("POST", "https://api.example.com/items", "hello")
```

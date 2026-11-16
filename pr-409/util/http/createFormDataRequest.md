# createFormDataRequest()

- Kind: function
- Import: `import { createFormDataRequest } from "shelving/util/http";`

Create a multipart form-data `Request`.
- `HEAD` and `GET` requests never send a body.

## Signatures

```ts
createFormDataRequest(method: RequestBodyMethod, url: PossibleURL, body: FormData, options: RequestOptions = {}, caller: AnyCaller = createFormDataRequest): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestBodyMethod` | The HTTP method. |
| `url` | `PossibleURL` | The target URL. |
| `body` | `FormData` | The `FormData` payload. |
| `options` | `RequestOptions` | Additional request options. Defaults to `{}`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `createFormDataRequest`). Defaults to `createFormDataRequest`. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | A `Request` with a multipart body. |

## Examples

```ts
createFormDataRequest("POST", "https://api.example.com/upload", new FormData())
```

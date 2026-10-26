# createHeadRequest()

- Kind: function
- Import: `import { createHeadRequest } from "shelving/util/http";`

Create a body-less `Request`.
- `HEAD` and `GET` requests never send a body.

## Signatures

```ts
createHeadRequest(method: RequestHeadMethod, url: PossibleURL, params: Nullish<PossibleURIParams>, options: RequestOptions = {}, caller: AnyCaller = createHeadRequest): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestHeadMethod` | The HTTP method. |
| `url` | `PossibleURL` | The target URL. |
| `params` | `Nullish<PossibleURIParams>` | `?query` params to encode into the URL. |
| `options` | `RequestOptions` | Additional request options. Defaults to `{}`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `createHeadRequest`). Defaults to `createHeadRequest`. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | A `Request` with no body content. |

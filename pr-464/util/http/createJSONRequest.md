# createJSONRequest()

- Kind: function
- Import: `import { createJSONRequest } from "shelving/util/http";`

Create a JSON `Request`.
- `HEAD` and `GET` requests never send a body.
- If the JSON body is a data object for `HEAD` or `GET`, it is appended as `?query` params instead.

## Signatures

```ts
createJSONRequest(method: RequestBodyMethod, url: PossibleURL, body: unknown, options: RequestOptions = {}, caller: AnyCaller = createJSONRequest): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestBodyMethod` | The HTTP method. |
| `url` | `PossibleURL` | The target URL. |
| `body` | `unknown` | The value to JSON-encode. |
| `options` | `RequestOptions` | Additional request options. Defaults to `{}`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `createJSONRequest`). Defaults to `createJSONRequest`. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | A `Request` with `application/json` content type. |

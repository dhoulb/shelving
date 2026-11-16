# createRequest()

- Kind: function
- Import: `import { createRequest } from "shelving/util/http";`

Create a `Request` instance with a valid content type based on the body.
- `undefined` or `null` are sent with no body.
- `FormData` is sent with `multipart/formdata`
- `string` is sent with `text/plain` header.
- Anything else is sent as `application/json`
- Expects a fully valid URL (any `{placeholders}` in the URL are not considered).
- As per the HTTP spec, `GET` and `HEAD` requests cannot contain a body

## Signatures

```ts
createRequest(method: RequestMethod, url: PossibleURL, payload: unknown, options: RequestOptions = {}, caller: AnyCaller = createRequest): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestMethod` | The HTTP method. |
| `url` | `PossibleURL` | The target URL. |
| `payload` | `unknown` | The body payload, whose type selects the content type. |
| `options` | `RequestOptions` | Additional request options. Defaults to `{}`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `createRequest`). Defaults to `createRequest`. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | A `Request` with a content type chosen to match `payload`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | if this is a `HEAD` or `GET` request but `body` is not a data object. |

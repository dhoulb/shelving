# createXMLRequest()

- Kind: function
- Import: `import { createXMLRequest } from "shelving/util/http";`

Create an XML `Request`.
- `HEAD` and `GET` requests never send a body.
- For `HEAD` and `GET`, the data object is appended as `?query` params instead.

## Signatures

```ts
createXMLRequest(method: RequestBodyMethod, url: PossibleURL, data: Data, options: RequestOptions = {}, caller: AnyCaller = createXMLRequest): Request
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `method` | `RequestBodyMethod` | The HTTP method. |
| `url` | `PossibleURL` | The target URL. |
| `data` | `Data` | The data object to serialize as XML. |
| `options` | `RequestOptions` | Additional request options. Defaults to `{}`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `createXMLRequest`). Defaults to `createXMLRequest`. |

## Returns

| Type | Description |
| --- | --- |
| `Request` | A `Request` with `application/xml` content type. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If the XML data contains invalid element names or values. |

## Examples

```ts
createXMLRequest("POST", "https://api.example.com/items", { item: { name: "abc" } })
```

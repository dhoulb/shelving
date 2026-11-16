# parseRequestBody()

- Kind: function
- Import: `import { parseRequestBody } from "shelving/util/http";`

Parse the body content of an HTTP `Request` based on its content type, or throw `RequestError` if the content could not be parsed.

## Signatures

```ts
parseRequestBody(request: Request, caller: AnyCaller = parseRequestBody): Promise<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` whose body to parse. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `parseRequestBody`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<unknown>` | undefined If the request method is `GET` or `HEAD` (these request methods have no body). |
| `unknown` | unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty). |
| `unknown` | unknown If content type is `multipart/form-data` then convert it to a simple `Data` object. |
| `unknown` | string If content type is `text/plain` or anything else (including `""` empty string if it's empty). |

## Throws

| Type | Description |
| --- | --- |
| `RequestError` | If the content is not `text/plain`, or `application/json` with valid JSON. |

# parseResponseBody()

- Kind: function
- Import: `import { parseResponseBody } from "shelving/util/http";`

Parse the body content of an HTTP `Response` based on its content type, or throw `ResponseError` if the content could not be parsed.

## Signatures

```ts
parseResponseBody(response: Response, caller: AnyCaller = parseResponseBody): Promise<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `response` | `Response` | The `Response` whose body to parse. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `parseResponseBody`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<unknown>` | unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty). |
| `unknown` | unknown If content type is `multipart/form-data` then convert it to a simple `Data` object. |
| `unknown` | string If content type is `text/plain` or anything else (including `""` empty string if it's empty). |

## Throws

| Type | Description |
| --- | --- |
| `ResponseError` | If the content is not `text/plain` or `application/json` with valid JSON. |

# parseResponseFormData()

- Kind: function
- Import: `import { parseResponseFormData } from "shelving/util/http";`

Parse `FormData` from an HTTP `Response`, or return `undefined` when the response has no body.

## Signatures

```ts
parseResponseFormData(response: Response, caller: AnyCaller = parseResponseFormData): Promise<FormData>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `response` | `Response` | The `Response` whose form-data body to parse. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `parseResponseFormData`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<FormData>` | The parsed `FormData`. |

## Throws

| Type | Description |
| --- | --- |
| `ResponseError` | If the response body is not valid multipart form-data. |

## Examples

```ts
const form = await parseResponseFormData(response);
```

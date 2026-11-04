# parseRequestFormData()

- Kind: function
- Import: `import { parseRequestFormData } from "shelving/util/http";`

Parse `FormData` from an HTTP `Request`, or return `undefined` when the request has no body.

## Signatures

```ts
parseRequestFormData(request: Request, caller: AnyCaller = parseRequestFormData): Promise<FormData | undefined>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` whose form-data body to parse. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `parseRequestFormData`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<FormData \| undefined>` | The parsed `FormData`. |

## Throws

| Type | Description |
| --- | --- |
| `RequestError` | If the request body is not valid multipart form-data. |

## Examples

```ts
const form = await parseRequestFormData(request);
```

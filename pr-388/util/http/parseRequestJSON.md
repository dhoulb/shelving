# parseRequestJSON()

- Kind: function
- Import: `import { parseRequestJSON } from "shelving/util/http";`

Parse JSON from an HTTP `Request`, or return `undefined` when the request has no body.

## Signatures

```ts
parseRequestJSON(request: Request, caller: AnyCaller = parseRequestJSON): Promise<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` whose JSON body to parse. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `parseRequestJSON`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<unknown>` | The parsed JSON value, or `undefined` if the body is empty. |

## Throws

| Type | Description |
| --- | --- |
| `RequestError` | If the request body is not valid JSON. |

# parseResponseJSON()

- Kind: function
- Import: `import { parseResponseJSON } from "shelving/util/http";`

Parse JSON from an HTTP `Response`, or return `undefined` when the response has no body.

## Signatures

```ts
parseResponseJSON(response: Response, caller: AnyCaller = parseResponseJSON): Promise<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `response` | `Response` | The `Response` whose JSON body to parse. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `parseResponseJSON`. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<unknown>` | The parsed JSON value, or `undefined` if the body is empty. |

## Throws

| Type | Description |
| --- | --- |
| `ResponseError` | If the response body is not valid JSON. |

## Examples

```ts
const data = await parseResponseJSON(response);
```

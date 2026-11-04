# debugFullResponse()

- Kind: function
- Import: `import { debugFullResponse } from "shelving/util/debug";`

Debug a full `Response` as a string including its headers and body.
- Clones the response before reading the body so the original response can still be parsed later.
- Omits the headers section when there are no headers.
- Omits the body section when the response body is empty.

## Signatures

```ts
debugFullResponse(response: Response): Promise<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `response` | `Response` | The `Response` to debug. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<string>` | A promise resolving to the status line, headers, and body as a string. |

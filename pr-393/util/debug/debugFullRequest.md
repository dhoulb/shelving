# debugFullRequest()

- Kind: function
- Import: `import { debugFullRequest } from "shelving/util/debug";`

Debug a full `Request` as a string including its body.
- Clones the request before reading the body so the original request can still be sent or parsed later.
- Omits the body section when the request body is empty.

## Signatures

```ts
debugFullRequest(request: Request): Promise<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` to debug. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<string>` | A promise resolving to the request line, headers, and body as a string. |

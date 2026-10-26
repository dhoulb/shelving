# debugRequest()

- Kind: function
- Import: `import { debugRequest } from "shelving/util/debug";`

Convert a `Request` into a one-line debug string.
- Shows the method and URL only (no headers or body).

## Signatures

```ts
debugRequest(request: Request): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `request` | `Request` | The `Request` to debug. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A string in `METHOD url` format. |

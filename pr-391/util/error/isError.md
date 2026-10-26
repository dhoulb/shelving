# isError()

- Kind: function
- Import: `import { isError } from "shelving/util/error";`

Is an unknown value an `Error` instance?
- Uses the native `Error.isError()` if available, otherwise falls back to `instanceof Error`.

## Signatures

```ts
isError(v: unknown): v is Error & { readonly code?: string | undefined }
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `v` | `unknown` | The value to check and narrow. |

## Returns

| Type | Description |
| --- | --- |
| `v is Error & { readonly code?: string \| undefined }` | `true` if `v` is an `Error` (narrowing it, with an optional `code` string). |

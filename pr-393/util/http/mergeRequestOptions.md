# mergeRequestOptions()

- Kind: function
- Import: `import { mergeRequestOptions } from "shelving/util/http";`

Merge provider-level and call-level request options.
- Scalar options from `b` override `a`.
- Header dictionaries are merged so call-level headers override default headers by key.
- Abort signals are merged, so either abort signal will cancel the request.

## Signatures

```ts
mergeRequestOptions({ headers: aHeaders, signal: aSignal, ...a }: RequestOptions = {}, { headers: bHeaders, signal: bSignal, ...b }: RequestOptions = {}): RequestOptions
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `a` | `RequestOptions` | The provider-level (default) request options. Defaults to `{}`. |
| `b` | `RequestOptions` | The call-level request options whose values override `a`. Defaults to `{}`. |

## Returns

| Type | Description |
| --- | --- |
| `RequestOptions` | A merged `RequestOptions` with combined headers and abort signals. |

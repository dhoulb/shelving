# debugHeaders()

- Kind: function
- Import: `import { debugHeaders } from "shelving/util/debug";`

Convert a set of `Headers` into a debug string.
- One `key: value` pair per line.

## Signatures

```ts
debugHeaders(headers: Headers): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `headers` | `Headers` | The `Headers` object to debug. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A newline-separated string of `key: value` pairs. |

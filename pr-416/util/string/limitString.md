# limitString()

- Kind: function
- Import: `import { limitString } from "shelving/util/string";`

Limit a string to a given length.
- Stops at the last space inside `maxLength`
- Appends an `…` ellipses after the string (but only if a limit is applied).

## Signatures

```ts
limitString(str: string, maxLength: number, append = "…"): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to limit. |
| `maxLength` | `number` | The maximum length of the returned string (before `append` is added). |
| `append` | `unknown` | The string to append when a limit is applied (defaults to `"…"`). Defaults to `"…"`. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | `str` unchanged if it's shorter than `maxLength`, otherwise truncated with `append` added. |

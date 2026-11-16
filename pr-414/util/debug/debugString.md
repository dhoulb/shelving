# debugString()

- Kind: function
- Import: `import { debugString } from "shelving/util/debug";`

Convert a string into a quoted, escaped debug string.
- Wraps the value in double quotes and escapes control characters, quotes, and backslashes.

## Signatures

```ts
debugString(value: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `string` | The string to debug. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The quoted and escaped string. |

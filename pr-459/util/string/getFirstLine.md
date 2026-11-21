# getFirstLine()

- Kind: function
- Import: `import { getFirstLine } from "shelving/util/string";`

Get the (trimmed) first full line of a string.

## Signatures

```ts
getFirstLine(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to read the first line from. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The trimmed first line of `str` (everything before the first `\n` newline). |

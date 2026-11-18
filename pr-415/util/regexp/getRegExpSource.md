# getRegExpSource()

- Kind: function
- Import: `import { getRegExpSource } from "shelving/util/regexp";`

Convert a regular expression to its string source.
- If `regexp` is a `string` it is returned as-is, otherwise its `.source` is returned.

## Signatures

```ts
getRegExpSource(regexp: PossibleRegExp): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `regexp` | `PossibleRegExp` | The regular expression or string source to read. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The string source of the regular expression. |

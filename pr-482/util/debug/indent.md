# indent()

- Kind: function
- Import: `import { indent } from "shelving/util/debug";`

Indent a string for nested debug output.
- Multiline strings are pushed onto a new line with a tab prepended to each line.
- Single-line strings are simply prefixed with a space.

## Signatures

```ts
indent(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to indent. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The indented string. |

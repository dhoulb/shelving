# getRef()

- Kind: function
- Import: `import { getRef } from "shelving/util/string";`

Convert a string to a unique ref e.g. `abc123`, or return `undefined` if conversion resulted in an empty string.

## Signatures

```ts
getRef(str: string): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to convert. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The ref, or `undefined` if conversion resulted in an empty string. |

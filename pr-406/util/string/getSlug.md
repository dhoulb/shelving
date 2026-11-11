# getSlug()

- Kind: function
- Import: `import { getSlug } from "shelving/util/string";`

Convert a string to a `kebab-case` URL slug, or return `undefined` if conversion resulted in an empty ref.

## Signatures

```ts
getSlug(str: string): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to convert. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The `kebab-case` slug, or `undefined` if conversion resulted in an empty string. |

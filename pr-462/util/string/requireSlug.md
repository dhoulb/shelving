# requireSlug()

- Kind: function
- Import: `import { requireSlug } from "shelving/util/string";`

Convert a string to a `kebab-case` URL slug, or throw `RequiredError` if conversion resulted in an empty ref.

## Signatures

```ts
requireSlug(str: string, caller: AnyCaller = requireSlug): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to convert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireSlug` itself). Defaults to `requireSlug`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The `kebab-case` slug. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If conversion resulted in an empty string. |

# getDocumentationKindColor()

- Kind: function
- Import: `import { getDocumentationKindColor } from "shelving/ui";`

Get the raw colour variant for a documented symbol's `kind`, or `undefined` for an unknown kind.
- Shared source of truth so the kind tag and its surrounding card pick the same hue.

## Signatures

```ts
getDocumentationKindColor(kind: string): ColorVariant | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `kind` | `string` | The documented symbol's kind (e.g. `"function"`, `"class"`, `"method"`). |

## Returns

| Type | Description |
| --- | --- |
| `ColorVariant \| undefined` | The matching `ColorVariant`, or `undefined` when the kind is unrecognised. |

## Examples

```ts
getDocumentationKindColor("class") // "pink"
```

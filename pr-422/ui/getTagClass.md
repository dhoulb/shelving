# getTagClass()

- Kind: function
- Import: `import { getTagClass } from "shelving/ui";`

Build the combined `className` string for a `<Tag>` from its styling variants.

## Signatures

```ts
getTagClass(variants: TagVariants): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `TagVariants` | The status, colour, and typography variants to apply. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | The merged tag `className` string. |

## Examples

```ts
getTagClass({ success: true }) // "tag … status-success"
```

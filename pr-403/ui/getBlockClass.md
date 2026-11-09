# getBlockClass()

- Kind: function
- Import: `import { getBlockClass } from "shelving/ui";`

Get the combined `className` string for a block from its styling variants.

Composes the base block class and tint ladder with the colour, space, typography, and width variant helpers, so anything that wants block-level styling can apply it.

## Signatures

```ts
getBlockClass(variants: BlockVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `BlockVariants` |  |

## Returns

| Type | Description |
| --- | --- |
| `string` | A space-separated `className` string combining the block class and resolved variant classes. |

## Examples

```ts
getBlockClass({ space: "large" }) // "block tint …"
```
